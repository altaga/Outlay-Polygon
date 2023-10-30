import {HeliusAPI} from '@env';
import {encodeURL, findReference} from '@solana/pay';
import {Connection, Keypair, PublicKey} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
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
  View,
} from 'react-native';
import {Picker} from 'react-native-form-component';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCodeStyled from 'react-native-qrcode-styled';
import QRCode from 'react-native-qrcode-svg';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import {logo} from '../../assets/logo';
import Tick from '../../assets/tick.png';
import GlobalStyles from '../../styles/styles';
import {splTokens} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';

const baseSolanaPay = {
  // Functionals
  loading: false,
  // Stage
  stage: 0,
  // FormData
  tokenSelected: {
    value: null,
    label: 'SOL',
  },
  amount: '',
  jupiter: false,
  label: '',
  message: '',
  memo: '',
  // Solana Pay
  qr: 'seed',
  paymentStatus: 'Pending...',
  signature: '', // ""
  printData: '',
};

class SolanaPay extends Component {
  constructor(props) {
    super(props);
    this.state = baseSolanaPay;
    reactAutobind(this);
    this.interval = null;
    this.connection = new Connection(
      `https://rpc.helius.xyz/?api-key=${HeliusAPI}`,
      'confirmed',
    );
    this.svg = null;
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

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseSolanaPay);
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseSolanaPay);
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async createPayment() {
    this.setState({
      loading: true,
    });
    // Create Solana Pay QR
    const {label, message, memo} = this.state;
    const recipient = new PublicKey(this.context.value.solAddress);
    const splToken = this.state.tokenSelected.value;
    const amount = new BigNumber(this.state.amount);
    const reference = new Keypair().publicKey;
    const url =
      this.state.tokenSelected.label === 'SOL'
        ? encodeURL({
            recipient,
            amount: this.state.amount !== '' ? amount : this.state.amount,
            reference,
            label,
            message,
            memo,
          })
        : encodeURL({
            recipient,
            amount: this.state.amount !== '' ? amount : this.state.amount,
            reference,
            label,
            message,
            memo,
            splToken,
          });
    await this.setStateAsync({
      qr: url.toString(),
      loading: false,
      paymentStatus: 'Pending...',
      stage: 1,
    });
    let signatureInfo;
    const {signature} = await new Promise((resolve, reject) => {
      this.interval = setInterval(async () => {
        try {
          console.log('.');
          signatureInfo = await findReference(this.connection, reference, {
            finality: 'confirmed',
          });
          clearInterval(this.interval);
          resolve(signatureInfo);
        } catch (error) {
          console.log(error);
        }
      }, 1000);
    });
    this.setState({paymentStatus: 'Confirmed...', loading: true});
    try {
      const latestBlockHash = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });
      this.setState({
        paymentStatus: 'Validated',
        loading: false,
        signature,
        qr: null,
        stage: 2,
      });
    } catch (error) {
      console.log('Payment failed', error);
      this.setState({
        paymentStatus: 'failed',
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
                  label="Token"
                  // Selected
                  selectedValueStyle={GlobalStyles.selectedValueStyle}
                  selectedValue={this.state.tokenSelected.value}
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
                <Text style={GlobalStyles.textInput}>Label</Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  value={this.state.label}
                  onChangeText={label => this.setState({label})}
                  textAlign="center"
                />
                <Text style={GlobalStyles.textInput}>Message</Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  value={this.state.message}
                  onChangeText={message => this.setState({message})}
                  textAlign="center"
                />
                <Text style={GlobalStyles.textInput}>Memo</Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  value={this.state.memo}
                  onChangeText={memo => this.setState({memo})}
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
                  {this.state.tokenSelected.label === 'SOL'
                    ? 'Receive Solana (SOL)'
                    : 'Receive ' + this.state.tokenSelected.label + ' Token'}
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
                    this.setState(baseSolanaPay);
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
                                } ${this.state.tokenSelected.label}</h1>
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

export default SolanaPay;
