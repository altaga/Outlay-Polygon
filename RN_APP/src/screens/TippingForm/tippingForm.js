import AsyncStorage from '@react-native-async-storage/async-storage';
import { encodeURL } from '@solana/pay';
import { Keypair, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { Picker } from 'react-native-form-component';
import QRCode from 'react-native-qrcode-svg';
import Fontisto from 'react-native-vector-icons/Fontisto';
import VersionCheck from 'react-native-version-check';
import backImage from '../../assets/backgrounds/backgroundTipping.png';
import GlobalStyles from '../../styles/styles';
import { splTokens } from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
const temp = VersionCheck.getPackageName()
myHeaders.append('Authorization', btoa(temp));

const baseTippingForm = {
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
  email: '',
  // Solana Pay
  qr: 'seed',
  printData: '',
  // Storage
  pending: [],
};

class TippingForm extends Component {
  constructor(props) {
    super(props);
    this.state = baseTippingForm;
    reactAutobind(this);
    this.pending = [];
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

  async setAsyncStorageValue(value) {
    const session = await AsyncStorage.getItem('General');
    await AsyncStorage.setItem(
      'General',
      JSON.stringify({
        ...JSON.parse(session),
        ...value,
      }),
    );
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

  async getAsyncStorageValue(value) {
    try {
      const session = await AsyncStorage.getItem('General');
      if (value in JSON.parse(session)) {
        return JSON.parse(session)[value];
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  async componentDidMount() {
    //this.erase() // DEBUG ONLY
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseTippingForm);
      this.pending = (await this.getAsyncStorageValue('pending')) ?? [];
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseTippingForm);
    });
  }

  async requestPayment() {
    await this.setStateAsync({
      loading: true,
    });
    const {label, message, memo} = this.state;
    const recipient = new PublicKey(this.context.value.solAddress);
    const splToken = this.state.tokenSelected.value;
    const amount = new BigNumber(this.state.amount);
    const reference = new Keypair().publicKey;
    const url =
      this.state.tokenSelected.label === 'SOL'
        ? encodeURL({recipient, amount, reference, label, message, memo})
        : encodeURL({
            recipient,
            amount,
            reference,
            label,
            message,
            memo,
            splToken,
          });
    await this.setStateAsyncDelay(
      {
        qr: url.toString(),
        stage: 0,
      },
      500,
    );
    await this.getDataURL();
    const flag = await this.requestEmail();
    if (flag) {
      this.pending.push({
        reference,
        status: 'Pending...',
      });
      this.setAsyncStorageValue({
        pending: this.pending,
      });
      this.setState({
        loading: false,
        stage: 1,
      });
    } else {
      ToastAndroid.showWithGravity(
        'Error sending email',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
      );
      this.setState({
        loading: false,
      });
    }
  }

  async requestEmail() {
    return new Promise(resolve => {
      var raw = JSON.stringify({
        email: this.state.email,
        address: this.context.value.solAddress,
        token: this.state.tokenSelected.label,
        solanaPayURL: this.state.qr,
        qrImage: this.state.printData,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch('https://api.outlay.site/email', requestOptions)
        .then(response => response.text())
        .then(result => {
          console.log(result);
          result === 'ok' ? resolve(true) : resolve(false);
        })
        .catch(e => {
          console.log(e);
          resolve(false);
        });
    });
  }

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
          {this.state.stage === 0 && (
            <KeyboardAwareScrollViewComponent>
              <ScrollView showsVerticalScrollIndicator={false} style={{paddingBottom: 50}}>
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
                <Text style={GlobalStyles.textInput}>Email</Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  value={this.state.email}
                  onChangeText={email => this.setState({email})}
                  textAlign="center"
                />
                <View
                  style={{
                    height: 3,
                    width: 'auto',
                    backgroundColor: '#db00ff',
                    marginTop: 20,
                    borderRadius: 3,
                  }}
                />
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#00e59933' : '#00e599',
                      marginVertical: 30,
                    },
                  ]}
                  onPress={async () => {
                    this.requestPayment();
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    {this.state.loading
                      ? 'Requesting Payment...'
                      : 'Request Payment'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: '#db00ff',
                    },
                  ]}
                  onPress={async () => {
                    this.props.navigation.navigate('Tipping');
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                </Pressable>
              </ScrollView>
            </KeyboardAwareScrollViewComponent>
          )}
          {this.state.stage === 1 && (
            <SafeAreaView
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                height: '100%',
              }}>
              <Fontisto
                name="email"
                size={Dimensions.get('window').width * 0.4}
                color={'#db00ff'}
              />
              <Text style={[GlobalStyles.titleModule]}>
                The email was sent correctly
              </Text>
              <Pressable
                style={[
                  GlobalStyles.buttonStyle,
                  {
                    borderColor: '#00e599',
                  },
                ]}
                onPress={async () => {
                  this.props.navigation.navigate('Tipping');
                }}>
                <Text style={[GlobalStyles.buttonTextStyle]}>Done</Text>
              </Pressable>
            </SafeAreaView>
          )}
        </ImageBackground>
        <View style={{position: 'absolute', bottom: -1000}}>
          <QRCode
            value={this.state.qr}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default TippingForm;
