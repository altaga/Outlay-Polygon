import {HeliusAPI} from '@env';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {Connection, PublicKey} from '@solana/web3.js';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {Picker} from 'react-native-form-component';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCodeStyled from 'react-native-qrcode-styled';
import QRCode from 'react-native-qrcode-svg';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import {logo} from '../../assets/logo';
import Tick from '../../assets/tick.png';
import GlobalStyles from '../../styles/styles';
import {splTokens} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';
import {tokens} from '../../utils/solanaTokens';

const baseSolanaPayJupiter = {
  // Functionals
  loading: false,
  // Stage
  stage: 0,
  // FormData
  inputTokenSelected: tokens[0],
  outputTokenSelected: splTokens.map(item => ({
    label: item.label,
    value: item.value,
  }))[1],
  amount: '',
  message: '',
  // Solana Pay
  qr: 'seed',
  paymentStatus: 'Pending...',
  signature: '', // ""
  printData: '',
};

class SolanaPayJupiter extends Component {
  constructor(props) {
    super(props);
    this.state = baseSolanaPayJupiter;
    reactAutobind(this);
    this.interval = null;
    this.connection = new Connection(
      `https://rpc.helius.xyz/?api-key=${HeliusAPI}`,
      'confirmed',
    );
    this.svg = null;
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  // Utils

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

  async checkQuote(params) {
    return new Promise(resolve => {
      fetch(`https://quote-api.jup.ag/v4/quote?${params}`, {
        method: 'GET',
        redirect: 'follow',
        signal: this.controller.signal,
      })
        .then(response => response.json())
        .then(result => resolve(result.data))
        .catch(error => resolve([]));
    });
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseSolanaPayJupiter);
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseSolanaPayJupiter);
      clearInterval(this.interval);
      this.controller.abort();
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.controller.abort();
  }

  async createPayment() {
    let error = 'Select Input Token';
    try {
      const baseUrl = 'solana:https://api.outlay.site/jupiter/';
      let mint = await this.connection.getParsedAccountInfo(
        new PublicKey(
          this.state.outputTokenSelected.value ??
            'So11111111111111111111111111111111111111112',
        ),
      );
      const decimals = mint.value.data.parsed.info.decimals;
      const myParams = {
        inputMint: this.state.inputTokenSelected.Mint,
        outputMint:
          this.state.outputTokenSelected.value ??
          'So11111111111111111111111111111111111111112',
        amount: `${epsilonRound(
          parseFloat(this.state.amount ?? '0.0') * Math.pow(10, decimals),
          decimals,
        )}`,
        swapMode: 'ExactOut', // Mode
        slippageBps: '50', // Slippage 0.5%
      };
      const jupiter = new URLSearchParams(myParams).toString();
      const quote = await this.checkQuote(jupiter);
      error = 'No pool available (Select Another Token or Amount)';
      if (quote.length === 0) throw new Error(error);
      this.setState({
        qr:
          baseUrl +
          btoa(
            JSON.stringify({
              merchant: this.context.value.solAddress,
              message:
                this.state.message.length > 0
                  ? this.state.message
                  : 'Hello from Outlay',
              jupiter,
            }),
          ),
        loading: false,
        paymentStatus: 'Pending...',
        stage: 1,
      });
      let merchantTokenAccount;
      if (
        myParams.outputMint === 'So11111111111111111111111111111111111111112'
      ) {
        merchantTokenAccount = new PublicKey(this.context.value.solAddress);
      } else {
        merchantTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(this.state.outputTokenSelected.value),
          new PublicKey(this.context.value.solAddress),
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );
      }
      const transactionList = await this.connection.getSignaturesForAddress(
        merchantTokenAccount,
        {
          limit: 1,
        },
      );
      let signature;
      const lastSignature = transactionList[0].signature;
      await new Promise(resolve => {
        this.interval = setInterval(async () => {
          try {
            const newSignature = await this.connection.getSignaturesForAddress(
              merchantTokenAccount,
              {
                limit: 1,
              },
            );
            if (lastSignature === newSignature[0].signature)
              throw new Error('Same Signature');
            clearInterval(this.interval);
            signature = newSignature[0].signature;
            resolve();
          } catch (error) {
            console.log(error);
          }
        }, 2000);
      });
      this.setState({
        paymentStatus: 'Confirmed',
        signature,
        explorerURL: `https://solana.fm/tx/${signature}?cluster=mainnet-solanafmbeta`,
        qr: null,
        stage: 2,
      });
    } catch (err) {
      console.log(err);
      ToastAndroid.showWithGravity(
        error,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
      );
      this.setState({
        loading: false,
      });
    }
  }

  render() {
    return (
      <React.Fragment>
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
            {this.state.stage === 0 && (
              <KeyboardAwareScrollViewComponent>
                <Text style={[GlobalStyles.textInput, {marginTop: 20}]}>
                  Input Token
                </Text>
                <SelectDropdown
                  data={tokens.map(item => item.Symbol)}
                  onSelect={(item, index) => {
                    this.setState({
                      inputTokenSelected: tokens[index],
                    });
                  }}
                  defaultButtonText={'Select Token'}
                  buttonTextAfterSelection={selectedItem => {
                    return selectedItem;
                  }}
                  rowTextForSelection={item => {
                    return item;
                  }}
                  buttonStyle={[
                    GlobalStyles.pickerInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginTop: 10,
                      marginBottom: 20,
                    },
                  ]}
                  buttonTextStyle={[
                    GlobalStyles.selectedValueStyle,
                    {marginLeft: 0},
                  ]}
                  renderDropdownIcon={isOpened => {
                    return (
                      <FontAwesome
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                        color={'#444'}
                        size={18}
                      />
                    );
                  }}
                  dropdownIconPosition={'right'}
                  dropdownStyle={{
                    backgroundColor: 'black',
                  }}
                  rowStyle={{
                    borderColor: '#00e599',
                    borderWidth: 1,
                  }}
                  rowTextStyle={[
                    GlobalStyles.selectedValueStyle,
                    {marginLeft: 0},
                  ]}
                  selectedRowStyle={{
                    backgroundColor: '#00e599',
                    color: 'black',
                  }}
                  search
                  searchInputStyle={{
                    backgroundColor: 'black',
                    borderColor: '#00e599',
                    borderWidth: 1,
                  }}
                  searchInputTxtStyle={{
                    fontSize: 24,
                    color: 'white',
                  }}
                  searchPlaceHolder={'Search Token Here'}
                  searchPlaceHolderColor={'white'}
                  renderSearchInputLeftIcon={() => {
                    return (
                      <FontAwesome name={'search'} color={'#444'} size={18} />
                    );
                  }}
                />
                <Picker
                  // Style Eq
                  buttonStyle={[
                    GlobalStyles.pickerInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginTop: 20,
                    },
                  ]}
                  // Button Disappear
                  iconWrapperStyle={GlobalStyles.iconWrapperStyle}
                  // Uppper Label
                  labelStyle={GlobalStyles.labelStyle}
                  label="Output Token"
                  // Selected
                  selectedValueStyle={GlobalStyles.selectedValueStyle}
                  selectedValue={this.state.outputTokenSelected.value}
                  items={splTokens.map(item => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  onSelection={tokenSelected => {
                    this.setState({
                      tokenSelected,
                    });
                  }}
                  type="modal"
                />
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Amount
                </Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  keyboardType="number-pad"
                  value={this.state.amount}
                  onChangeText={amount => this.setState({amount})}
                  textAlign="center"
                />
                <Text style={GlobalStyles.textInput}>Message</Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  value={this.state.message}
                  onChangeText={message => this.setState({message})}
                  textAlign="center"
                />
                <View
                  style={{
                    height: 3,
                    width: 'auto',
                    backgroundColor: '#00e599',
                    marginTop: 20,
                    borderRadius: 3,
                  }}
                />
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
                    this.createPayment();
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    {this.state.loading ? 'Creating...' : 'Create Payment'}
                  </Text>
                </Pressable>
              </KeyboardAwareScrollViewComponent>
            )}
            {this.state.stage === 1 && (
              <SafeAreaView
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  height: '100%',
                }}>
                <Text style={[GlobalStyles.titleModule]}>
                  {this.state.outputTokenSelected.label === 'SOL'
                    ? 'Receive Solana (SOL)'
                    : 'Receive ' +
                      this.state.outputTokenSelected.label +
                      ' Token'}
                </Text>
                <View
                  style={[
                    {
                      backgroundColor: '#000000',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#00e599',
                    },
                  ]}>
                  <QRCodeStyled
                    data={this.state.qr}
                    maxSize={Dimensions.get('screen').width * 0.85}
                    style={[
                      {
                        backgroundColor: '#000000',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#00e599',
                        margin: 10,
                      },
                    ]}
                    padding={4}
                    pieceBorderRadius={4}
                    isPiecesGlued
                    gradient={{
                      type: 'linear',
                      options: {
                        start: [0, 0],
                        end: [1, 1],
                        colors: ['white'], // colors: ['#db00ff', '#00e599'],
                        locations: [0, 1],
                      },
                    }}
                  />
                </View>
                <Text style={[GlobalStyles.titleModule]}>
                  {this.state.paymentStatus}
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
                  onPress={() => {
                    clearInterval(this.interval);
                    this.setState(baseSolanaPayJupiter);
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                </Pressable>
              </SafeAreaView>
            )}
            {this.state.stage === 2 && (
              <SafeAreaView
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  height: '100%',
                }}>
                <Image
                  resizeMode="contain"
                  source={Tick}
                  alt="Cat"
                  style={{
                    width: Dimensions.get('window').width * 0.4,
                    height: Dimensions.get('window').width * 0.4,
                  }}
                />
                <Text style={[GlobalStyles.titleModule]}>
                  {this.state.paymentStatus}
                </Text>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 20,
                    }}>
                    {this.context.value.settings.print ? (
                      <React.Fragment>
                        <Pressable
                          style={[
                            GlobalStyles.buttonRowLeftStyle,
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
                        <Pressable
                          style={[
                            GlobalStyles.buttonRowRightStyle,
                            {borderColor: '#00e599'},
                          ]}
                          onPress={async () => {
                            await this.getDataURL();
                            const results = await RNHTMLtoPDF.convert({
                              html: `
                            <div style="text-align: center;">
                                <img src='${logo}' width="400px"></img>
                                <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                <h1 style="font-size: 3rem;">Type: Solana Pay</h1>
                                <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                <h1 style="font-size: 3rem;">Transaction</h1>
                                <h1 style="font-size: 3rem;">Amount: ${
                                  this.state.amount
                                } ${this.state.outputTokenSelected.label}</h1>
                                <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                <img src='${this.state.printData}'></img>
                            </div>
                            `,
                              fileName: 'print',
                              base64: true,
                            });
                            await RNPrint.print({filePath: results.filePath});
                          }}>
                          <Text style={[GlobalStyles.buttonTextStyle]}>
                            Print
                          </Text>
                        </Pressable>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
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
                      </React.Fragment>
                    )}
                  </View>
                  <Pressable
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        borderColor: this.context.value.settings.print
                          ? '#47a6cc'
                          : '#00e599',
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
          </ImageBackground>
        </SafeAreaView>
        <View style={{position: 'absolute', bottom: -1000}}>
          <QRCode
            value={`https://solana.fm/tx/${this.state.signature}?cluster=mainnet-solanafmbeta`}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </React.Fragment>
    );
  }
}

export default SolanaPayJupiter;
