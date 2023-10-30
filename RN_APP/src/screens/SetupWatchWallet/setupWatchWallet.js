import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import EncryptedStorage from 'react-native-encrypted-storage';
import IconEntypo from 'react-native-vector-icons/Entypo';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import backImage from '../../assets/backgrounds/backgroundSetupWallet.png';
import GlobalStyles, { StatusBarHeight } from '../../styles/styles';
import Cam from '../../utils/cam';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';

const baseSetupWatchWallet = {
  // Utils
  step: 0,
  reset: false,
  // Wallet
  solAddress: '',
  ethAddress: '',
  // General
  biometrics: false,
  // Buttons
  loading: false,
  flag: false,
  // Pin
  pin: '',
};

const ratio = Dimensions.get('window').height / Dimensions.get('window').width;

function checkRegex(string) {
  return /[1-9A-HJ-NP-Za-km-z]{32,44}/.test(string);
}

class SetupWatchWallet extends Component {
  constructor(props) {
    super(props);
    this.state = baseSetupWatchWallet;
    this.biometrics = new ReactNativeBiometrics();
    reactAutobind(this);
  }

  static contextType = ContextModule;

  // utils

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

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseSetupWatchWallet);
      await this.createStorageGeneral();
      await this.setAsyncStorageValue({
        settings: this.context.value.settings
     });
      const biometrics = await this.biometrics.isSensorAvailable();
      console.log(biometrics);
      this.setState({
        biometrics: biometrics.available,
      });
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseSetupWatchWallet);
    });
  }

  // Step 0 - Set Wallet

  async createStorageGeneral(object) {
    await AsyncStorage.setItem('General', JSON.stringify({...object}));
    await EncryptedStorage.setItem('General', JSON.stringify({...object}));
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

  // Step 1 - Set Pin

  async changeText(val) {
    if (val.length <= 4) {
      this.setState({
        pin: val,
      });
    } else {
      await this.resetKeyboard();
    }
  }

  resetKeyboard() {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          clear: true,
        },
        () =>
          this.setState(
            {
              clear: false,
              pin: '',
            },
            () => resolve('ok'),
          ),
      );
    });
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <ImageBackground
          style={[GlobalStyles.imageBackground]}
          imageStyle={{
            opacity: 0.5,
          }}
          source={backImage}
          resizeMode="cover">
          {this.state.step === 0 && (
            <KeyboardAwareScrollViewComponent>
              <View
                style={{
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <View
                  style={{
                    flex: 10,
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      GlobalStyles.title,
                      {fontSize: ratio < 1.78 ? 20 : 24},
                    ]}>
                    Setup Watch-Only Wallet
                  </Text>
                  <Text
                    style={[
                      GlobalStyles.description,
                      {fontSize: ratio < 1.78 ? 14 : 20},
                    ]}>
                    {`Write or scan a solana\naddress to add it to the POS`}
                  </Text>
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                      style={[
                        GlobalStyles.textInput,
                        {marginTop: 0, fontSize: ratio < 1.78 ? 14 : 20},
                      ]}>
                      Write Address
                    </Text>
                    <TextInput
                      style={[
                        GlobalStyles.textInputStyle,
                        {
                          borderColor: '#00e599',
                          height: 'auto',
                          marginVertical: 10,
                          fontSize: 13,
                        },
                      ]}
                      placeholder=""
                      value={this.state.solAddress}
                      onChangeText={solAddress => this.setState({solAddress})}
                      textAlign="center"
                    />
                  </View>
                  <Text
                    style={[
                      GlobalStyles.textInput,
                      {marginTop: 0, fontSize: ratio < 1.78 ? 14 : 20},
                    ]}>
                    Scan Address
                  </Text>
                  <View
                    style={{
                      height:
                        Dimensions.get('screen').width *
                        (ratio < 1.78 ? 0.5 : 0.6),
                      width:
                        Dimensions.get('screen').width *
                        (ratio < 1.78 ? 0.5 : 0.6),
                      borderColor: '#00e599',
                      borderWidth: 5,
                      borderRadius: 10,
                    }}>
                    <Cam
                      reset={this.state.reset}
                      callbackAddress={solAddress =>
                        this.setState({
                          solAddress,
                        })
                      }
                      callbackAddressETH={() => this.resetCam()}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 4,
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {[...Array(5).keys()].map((item, index) => (
                      <Text
                        key={'dot:' + index}
                        style={{
                          color: this.state.step >= index ? 'white' : '#a3a3a3',
                          marginHorizontal: 20,
                          fontSize: 38,
                        }}>
                        {this.state.step >= index ? '•' : '·'}
                      </Text>
                    ))}
                  </View>
                  <Pressable
                    disabled={!checkRegex(this.state.solAddress)}
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        borderColor: !checkRegex(this.state.solAddress)
                          ? '#00e59933'
                          : '#00e599',
                      },
                    ]}
                    onPress={async () => {
                      await this.setAsyncStorageValue({
                        solAddress: this.state.solAddress,
                      });
                      this.setState({
                        step: 1,
                      });
                    }}>
                    <Text style={[GlobalStyles.buttonTextStyle]}>
                      Set Wallet
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[GlobalStyles.buttonStyle, {borderColor: '#db00ff'}]}
                    onPress={async () => {
                      this.props.navigation.navigate('SplashLoading');
                    }}>
                    <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAwareScrollViewComponent>
          )}
          {this.state.step === 1 && (
            <KeyboardAwareScrollViewComponent>
              <View
                style={{
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <View
                  style={{
                    flex: 10,
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      GlobalStyles.title,
                      {fontSize: ratio < 1.78 ? 20 : 24},
                    ]}>
                    Setup Watch-Only Wallet
                  </Text>
                  <Text
                    style={[
                      GlobalStyles.description,
                      {fontSize: ratio < 1.78 ? 14 : 20},
                    ]}>
                    {`Write or scan a EVM\naddress to add it to the POS`}
                  </Text>
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                      style={[
                        GlobalStyles.textInput,
                        {marginTop: 0, fontSize: ratio < 1.78 ? 14 : 20},
                      ]}>
                      Write Address
                    </Text>
                    <TextInput
                      style={[
                        GlobalStyles.textInputStyle,
                        {
                          borderColor: '#00e599',
                          height: 'auto',
                          marginVertical: 10,
                          fontSize: 13,
                        },
                      ]}
                      placeholder=""
                      value={this.state.ethAddress}
                      onChangeText={ethAddress => this.setState({ethAddress})}
                      textAlign="center"
                    />
                  </View>
                  <Text
                    style={[
                      GlobalStyles.textInput,
                      {marginTop: 0, fontSize: ratio < 1.78 ? 14 : 20},
                    ]}>
                    Scan Address
                  </Text>
                  <View
                    style={{
                      height:
                        Dimensions.get('screen').width *
                        (ratio < 1.78 ? 0.5 : 0.6),
                      width:
                        Dimensions.get('screen').width *
                        (ratio < 1.78 ? 0.5 : 0.6),
                      borderColor: '#00e599',
                      borderWidth: 5,
                      borderRadius: 10,
                    }}>
                    <Cam
                      reset={this.state.reset}
                      callbackAddressETH={ethAddress =>
                        this.setState({
                          ethAddress,
                        })
                      }
                      callbackAddress={() => this.resetCam()}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 4,
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {[...Array(5).keys()].map((item, index) => (
                      <Text
                        key={'dot:' + index}
                        style={{
                          color: this.state.step >= index ? 'white' : '#a3a3a3',
                          marginHorizontal: 20,
                          fontSize: 38,
                        }}>
                        {this.state.step >= index ? '•' : '·'}
                      </Text>
                    ))}
                  </View>
                  <Pressable
                    disabled={this.state.ethAddress.length !== 42}
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        borderColor:
                          this.state.ethAddress.length !== 42
                            ? '#00e59933'
                            : '#00e599',
                      },
                    ]}
                    onPress={async () => {
                      await this.setAsyncStorageValue({
                        ethAddress: this.state.ethAddress,
                      });
                      this.setState({
                        step: 2,
                      });
                    }}>
                    <Text style={[GlobalStyles.buttonTextStyle]}>
                      Set Wallet
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[GlobalStyles.buttonStyle, {borderColor: '#db00ff'}]}
                    onPress={async () => {
                      this.props.navigation.navigate('SplashLoading');
                    }}>
                    <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAwareScrollViewComponent>
          )}
          {this.state.step === 2 && (
            <React.Fragment>
              <View
                style={{
                  flex: 10,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <Text style={GlobalStyles.title}>Protect with a PIN</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingTop: '10%',
                  }}>
                  {[...Array(4).keys()].map((item, index) => (
                    <Text
                      key={'pinDot' + index}
                      style={{
                        color: 'white',
                        width: Dimensions.get('window').width * 0.2,
                        textAlign: 'center',
                        fontSize: 24,
                      }}>
                      {this.state.pin.substring(index, index + 1) !== ''
                        ? this.state.pin.substring(index, index + 1)
                        : '•'}
                    </Text>
                  ))}
                </View>
                <VirtualKeyboard
                  rowStyle={{
                    width: Dimensions.get('window').width,
                  }}
                  cellStyle={{
                    height: Dimensions.get('window').height * 0.08,
                    borderWidth: 0,
                    margin: 1,
                  }}
                  colorBack={'black'}
                  color="white"
                  pressMode="string"
                  onPress={val => this.changeText(val)}
                  clear={this.state.clear}
                />
              </View>
              <View
                style={{
                  flex: 4,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {[...Array(5).keys()].map((item, index) => (
                    <Text
                      key={'dot:' + index}
                      style={{
                        color: this.state.step >= index ? 'white' : '#a3a3a3',
                        marginHorizontal: 20,
                        fontSize: 38,
                      }}>
                      {this.state.step >= index ? '•' : '·'}
                    </Text>
                  ))}
                </View>
                <Pressable
                  disabled={this.state.pin.length !== 4}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor:
                        this.state.pin.length !== 4 ? '#00e59933' : '#00e599',
                    },
                  ]}
                  onPress={async () => {
                    await this.setEncryptedStorageValue({
                      pin: this.state.pin,
                    });
                    this.setState({
                      step: this.state.biometrics ? 3 : 4,
                    });
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Set Pin</Text>
                </Pressable>
                <Pressable
                  style={[GlobalStyles.buttonStyle, {borderColor: '#db00ff'}]}
                  onPress={async () => {
                    this.props.navigation.navigate('SplashLoading');
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                </Pressable>
              </View>
            </React.Fragment>
          )}
          {this.state.step === 3 && (
            <React.Fragment>
              <View
                style={{
                  flex: 10,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <Text style={GlobalStyles.title}>Protect with Biometrics</Text>
                <IconEntypo
                  name="fingerprint"
                  size={200}
                  color={'white'}
                  style={{
                    marginVertical: '20%',
                  }}
                />
              </View>
              <View
                style={{
                  flex: 4,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {[...Array(5).keys()].map((item, index) => (
                    <Text
                      key={'dot:' + index}
                      style={{
                        color: this.state.step >= index ? 'white' : '#a3a3a3',
                        marginHorizontal: 20,
                        fontSize: 38,
                      }}>
                      {this.state.step >= index ? '•' : '·'}
                    </Text>
                  ))}
                </View>
                <Pressable
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: '#00e599',
                    },
                  ]}
                  onPress={async () => {
                    this.biometrics
                      .simplePrompt({promptMessage: 'Confirm fingerprint'})
                      .then(async resultObject => {
                        const {success} = resultObject;
                        if (success) {
                          this.setState({
                            step: 4,
                          });
                        } else {
                          console.log('User cancelled biometric prompt');
                        }
                      })
                      .catch(async () => {
                        console.log('Biometrics failed!');
                      });
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    Set Biometrics
                  </Text>
                </Pressable>
                <Pressable
                  style={[GlobalStyles.buttonStyle, {borderColor: '#db00ff'}]}
                  onPress={async () => {
                    this.props.navigation.navigate('SplashLoading');
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                </Pressable>
              </View>
            </React.Fragment>
          )}
          {this.state.step === 4 && (
            <React.Fragment>
              <View
                style={{
                  flex: 10,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <Text style={[GlobalStyles.title, {marginVertical: 20}]}>
                  All Done!
                </Text>
                <Text style={[GlobalStyles.description, {margin: 20}]}>
                  {`Start your decentralized\neconomy with this POS`}
                </Text>
              </View>
              <View
                style={{
                  flex: 4,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {[...Array(5).keys()].map((item, index) => (
                    <Text
                      key={'dot:' + index}
                      style={{
                        color: this.state.step >= index ? 'white' : '#a3a3a3',
                        marginHorizontal: 20,
                        fontSize: 38,
                      }}>
                      {this.state.step >= index ? '•' : '·'}
                    </Text>
                  ))}
                </View>
                <Pressable
                  style={[GlobalStyles.buttonStyle, {borderColor: '#00e599'}]}
                  onPress={async () => {
                    await this.setAsyncStorageValue({
                      kind: 1,
                      biometrics: this.state.biometrics,
                    });
                    this.props.navigation.navigate('SplashLoading');
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Done</Text>
                </Pressable>
              </View>
            </React.Fragment>
          )}
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default SetupWatchWallet;
