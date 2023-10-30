import {HeliusAPI} from '@env';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import QRCode from 'react-native-qrcode-svg';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import GlobalStyles, {StatusBarHeight} from '../../styles/styles';
import Cam from '../../utils/cam';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';
import Tick from '../../assets/tick.png';
import {APP_IDENTITY} from '../../utils/constants';
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

const baseTransferSOL = {
  stage: 0, //""
  solAddress: '', // ""
  signature: '',
  reset: false,
  loading: false,
  amount: '0.0001',
  tokenSelected: {
    mint: '',
    symbol: 'SOL',
  },
};

class TransferSOL extends Component {
  constructor(props) {
    super(props);
    this.state = baseTransferSOL;
    reactAutobind(this);
    this.svg = null;
    this.connection = new Connection(
      `https://rpc.helius.xyz/?api-key=${HeliusAPI}`,
      'confirmed',
    );
  }

  static contextType = ContextModule;

  async getDataURL() {
    return new Promise(async (resolve, reject) => {
      this.svg.toDataURL(async data => {
        this.setState(
          {
            printData: 'data:image/png;base64,' + data,
          },
          () => resolve('ok'),
        );
      });
    });
  }

  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  async setStateAsyncDelay(value, delay) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () =>
          setTimeout(() => {
            resolve();
          }, delay),
      );
    });
  }

  async getEncryptStorageValue(value) {
    try {
      const session = await EncryptedStorage.getItem('General');
      if (value in JSON.parse(session)) {
        return JSON.parse(session)[value];
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  async setEncryptedStorageValue(value) {
    const session = await EncryptedStorage.getItem('General');
    await EncryptedStorage.setItem(
      'General',
      JSON.stringify({
        ...JSON.parse(session),
        ...value,
      }),
    );
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      const {token} = this.props.route.params;
      console.log(this.props.route.name);
      await this.setStateAsync({
        ...baseTransferSOL,
        tokenSelected: token,
      });
      this.resetCam();
    });
    this.props.navigation.addListener('blur', async () => {
      await this.setStateAsync(baseTransferSOL);
      this.resetCam();
    });
  }

  resetCam() {
    this.setState(
      {
        reset: true,
      },
      () =>
        this.setState({
          reset: false,
        }),
    );
  }

  async send() {
    if (this.context.value.kind === 0) {
      let transaction = new Transaction();
      if (this.state.tokenSelected.mint === '') {
        const BigInt = require('big-integer');
        const originAddress = new PublicKey(this.context.value.solAddress);
        const destinationAddress = new PublicKey(this.state.solAddress);
        const amount = BigInt(parseFloat(this.state.amount) * LAMPORTS_PER_SOL);
        const recentBlockhash = (await this.connection.getLatestBlockhash())
          .blockhash;
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: originAddress,
            toPubkey: destinationAddress,
            lamports: amount,
          }),
        );
        transaction.recentBlockhash = recentBlockhash;
        transaction.feePayer = originAddress;
      } else {
        const BigInt = require('big-integer');
        const mintAddress = new PublicKey(this.state.tokenSelected.mint);
        const originAddress = new PublicKey(this.context.value.solAddress);
        const destinationAddress = new PublicKey(this.state.solAddress);
        const info = await this.connection.getParsedAccountInfo(mintAddress);
        const decimals = info.value.data.parsed.info.decimals;
        const amount = BigInt(
          parseFloat(this.state.amount) * Math.pow(10, decimals),
        );
        // To Address
        const originTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          originAddress,
          (allowOwnerOffCurve = false),
          (programId = TOKEN_PROGRAM_ID),
          (associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID),
        );
        const destinationTokenAccount = await getAssociatedTokenAddress(
          mintAddress,
          destinationAddress,
          (allowOwnerOffCurve = false),
          (programId = TOKEN_PROGRAM_ID),
          (associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID),
        );
        let isTokenAccountAlreadyMade = false;
        try {
          await getAccount(
            this.connection,
            destinationTokenAccount,
            'confirmed',
            TOKEN_PROGRAM_ID,
          );
          isTokenAccountAlreadyMade = true;
        } catch {
          // Nothing
        }
        const recentBlockhash = (await this.connection.getLatestBlockhash())
          .blockhash;
        // Legacy for Gas
        if (!isTokenAccountAlreadyMade) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              originAddress,
              destinationTokenAccount,
              destinationAddress,
              mintAddress,
              TOKEN_PROGRAM_ID,
            ),
          );
        }
        transaction.add(
          createTransferInstruction(
            originTokenAccount,
            destinationTokenAccount,
            originAddress,
            amount,
          ),
        );
        transaction.recentBlockhash = recentBlockhash;
        transaction.feePayer = originAddress;
      }
      const session = await this.getEncryptStorageValue('solPrivate');
      const wallet = Keypair.fromSecretKey(Uint8Array.from(session.split(',')));
      transaction.sign(wallet);
      try {
        const signature = await this.connection.sendRawTransaction(
          transaction.serialize(),
          {
            maxRetries: 5,
          },
        );
        this.setState({
          signature,
          stage: 2,
          loading: false,
        });
      } catch (e) {
        console.log(e);
        this.setState({
          loading: false,
        });
      }
    } else if (this.context.value.kind === 2) {
      transact(async wallet => {
        try {
          const auth_token = await this.getEncryptStorageValue('auth_token');
          await wallet.reauthorize({
            auth_token,
            identity: APP_IDENTITY,
          });
        } catch (err) {
          try {
            const {auth_token} = await wallet.authorize({
              cluster: 'mainnet-beta',
              identity: APP_IDENTITY,
            });
            await this.setEncryptedStorageValue({
              auth_token,
            });
          } catch (err) {
            console.log(err);
          }
        }
        let transaction = new Transaction();
        if (this.state.tokenSelected.mint === '') {
          const BigInt = require('big-integer');
          const originAddress = new PublicKey(this.context.value.solAddress);
          const destinationAddress = new PublicKey(this.state.solAddress);
          const amount = BigInt(
            parseFloat(this.state.amount) * LAMPORTS_PER_SOL,
          );
          const recentBlockhash = (await this.connection.getLatestBlockhash())
            .blockhash;
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: originAddress,
              toPubkey: destinationAddress,
              lamports: amount,
            }),
          );
          transaction.recentBlockhash = recentBlockhash;
          transaction.feePayer = originAddress;
        } else {
          const BigInt = require('big-integer');
          const mintAddress = new PublicKey(this.state.tokenSelected.mint);
          const originAddress = new PublicKey(this.context.value.solAddress);
          const destinationAddress = new PublicKey(this.state.solAddress);
          const info = await this.connection.getParsedAccountInfo(mintAddress);
          const decimals = info.value.data.parsed.info.decimals;
          const amount = BigInt(
            parseFloat(this.state.amount) * Math.pow(10, decimals),
          );
          // To Address
          const originTokenAccount = await getAssociatedTokenAddress(
            mintAddress,
            originAddress,
            (allowOwnerOffCurve = false),
            (programId = TOKEN_PROGRAM_ID),
            (associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID),
          );
          const destinationTokenAccount = await getAssociatedTokenAddress(
            mintAddress,
            destinationAddress,
            (allowOwnerOffCurve = false),
            (programId = TOKEN_PROGRAM_ID),
            (associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID),
          );
          let isTokenAccountAlreadyMade = false;
          try {
            await getAccount(
              this.connection,
              destinationTokenAccount,
              'confirmed',
              TOKEN_PROGRAM_ID,
            );
            isTokenAccountAlreadyMade = true;
          } catch {
            // Nothing
          }
          const recentBlockhash = (await this.connection.getLatestBlockhash())
            .blockhash;
          // Legacy for Gas
          if (!isTokenAccountAlreadyMade) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                originAddress,
                destinationTokenAccount,
                destinationAddress,
                mintAddress,
                TOKEN_PROGRAM_ID,
              ),
            );
          }
          transaction.add(
            createTransferInstruction(
              originTokenAccount,
              destinationTokenAccount,
              originAddress,
              amount,
            ),
          );
          transaction.recentBlockhash = recentBlockhash;
          transaction.feePayer = originAddress;
        }
        const [signature] = await wallet.signTransactions({
          transactions: [transaction],
        });
        try {
          const signatures = await this.connection.sendRawTransaction(
            signature.serialize(),
            {
              maxRetries: 5,
            },
          );
          this.setState({
            signature: signatures,
            stage: 2,
            loading: false,
          });
        } catch (e) {
          console.log(e);
          this.setState({
            loading: false,
          });
        }
      });
    }
  }

  async componentWillUnmount() {}

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ImageBackground
          style={[
            GlobalStyles.imageBackground,
            {justifyContent: 'space-around'},
          ]}
          imageStyle={{
            opacity: 0.5,
          }}
          source={backImage}
          resizeMode="cover">
          <KeyboardAwareScrollViewComponent>
            {this.state.stage === 0 && (
              <SafeAreaView
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <Text
                  style={[
                    GlobalStyles.textInput,
                    {margin: 0, fontSize: 20, textAlign: 'center'},
                  ]}>
                  {`Scan Address (Send ${this.state.tokenSelected.symbol})`}
                </Text>
                <View
                  style={{
                    height: Dimensions.get('screen').height * 0.6,
                    width: Dimensions.get('screen').width * 0.8,
                    borderColor: '#00e599',
                    borderWidth: 5,
                    borderRadius: 10,
                  }}>
                  <Cam
                    reset={this.state.reset}
                    callbackAddress={solAddress =>
                      this.setState({
                        solAddress,
                        stage: 1,
                      })
                    }
                    callbackAddressETH={() => this.resetCam()}
                  />
                </View>
              </SafeAreaView>
            )}
            {this.state.stage === 1 && (
              <SafeAreaView
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Solana Address
                </Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginVertical: 10,
                      fontSize: 12,
                    },
                  ]}
                  keyboardType="default"
                  value={this.state.solAddress}
                  onChangeText={solAddress => this.setState({solAddress})}
                  textAlign="center"
                />
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Amount
                </Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  keyboardType="number-pad"
                  value={this.state.amount}
                  onChangeText={amount => this.setState({amount})}
                  textAlign="center"
                />
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Token
                </Text>
                <Text
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginVertical: 10,
                      textAlign: 'center',
                    },
                  ]}>
                  {this.state.tokenSelected.symbol}
                </Text>
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#db00ff33' : '#db00ff',
                      marginVertical: 30,
                    },
                  ]}
                  onPress={async () => {
                    await this.setStateAsyncDelay(
                      {
                        loading: true,
                      },
                      100,
                    );
                    this.send();
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    {this.state.loading ? 'Sending...' : 'Send'}
                  </Text>
                </Pressable>
              </SafeAreaView>
            )}
            {this.state.stage === 2 && (
              <SafeAreaView
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <View />
                <Image
                  resizeMode="contain"
                  source={Tick}
                  alt="Cat"
                  style={{
                    width: Dimensions.get('window').width * 0.4,
                    height: Dimensions.get('window').width * 0.4,
                  }}
                />
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 20,
                    }}>
                    <Pressable
                      style={[
                        GlobalStyles.buttonStyle,
                        {borderColor: '#db00ff'},
                      ]}
                      onPress={async () =>
                        Linking.openURL(
                          `https://solana.fm/tx/${this.state.signature}?cluster=mainnet-solanafmbeta`,
                        )
                      }>
                      <Text style={[GlobalStyles.buttonTextStyle]}>
                        Explorer
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        borderColor: '#00e599',
                      },
                    ]}
                    onPress={async () => {
                      this.props.navigation.navigate('Main');
                    }}>
                    <Text style={[GlobalStyles.buttonTextStyle]}>Done</Text>
                  </Pressable>
                </View>
              </SafeAreaView>
            )}
          </KeyboardAwareScrollViewComponent>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default TransferSOL;
