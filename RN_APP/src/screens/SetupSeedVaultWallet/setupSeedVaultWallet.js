import AsyncStorage from '@react-native-async-storage/async-storage';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import { generateMnemonic } from 'bip39';
import { Wallet } from 'ethers';
import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import EncryptedStorage from 'react-native-encrypted-storage';
import { toByteArray } from 'react-native-quick-base64';
import IconEntypo from 'react-native-vector-icons/Entypo';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import backImage from '../../assets/backgrounds/backgroundSetupWallet.png';
import GlobalStyles from '../../styles/styles';
import { APP_IDENTITY } from '../../utils/constants';
import ContextModule from '../../utils/contextModule';

const baseSetupNewWallet = {
  step: 0,
  // Wallet
  solAddress: '',
  mnemonic: '           ',
  // General
  biometrics: false,
  // Buttons
  loading: false,
  flag: false,
  // Pin
  pin: '',
};

class SetupSeedVaultWallet extends Component {
  constructor(props) {
    super(props);
    this.state = baseSetupNewWallet;
    this.biometrics = new ReactNativeBiometrics();
    reactAutobind(this);
  }

  static contextType = ContextModule;

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

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseSetupNewWallet);
      await this.createStorageGeneral();
      await this.setAsyncStorageValue({
        settings: this.context.value.settings
     });
      const biometrics = await this.biometrics.isSensorAvailable();
      this.setState({
        biometrics: biometrics.available,
      });
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseSetupNewWallet);
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

  connectWallet() {
    try {
      transact(async wallet => {
        const {accounts, auth_token} = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: APP_IDENTITY,
        });
        const firstAccount = accounts[0];
        const solAddress = new PublicKey(
          toByteArray(firstAccount.address),
        ).toString();
        await this.setAsyncStorageValue({
          solAddress,
          kind: 2,
          biometrics: this.state.biometrics,
        });
        await this.setEncryptedStorageValue({
          auth_token,
        });
        this.setState({
          solAddress,
          flag: true,
          loading: false,
        });
      });
    } catch (err) {
      console.log(err);
    }
  }

  async createWallet() {
    const mnemonic = generateMnemonic();
    const wallet = Wallet.fromMnemonic(mnemonic);
    this.setState({
      mnemonic,
      loading: false,
      flag: true,
    });
    await this.setEncryptedStorageValue({
      ethPrivate: wallet.privateKey,
    });
    await this.setAsyncStorageValue({
      ethAddress: wallet.address,
    });
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
            <React.Fragment>
              <View
                style={{
                  flex: 10,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <Text style={GlobalStyles.title}>Connect SAGA SeedVault</Text>
                <Text style={GlobalStyles.description}>
                  Connect Solana SAGA Seed Vault via Mobile Wallet Adapter using
                  your preferred wallet (Phantom, Solflare, etc)
                </Text>
                <Text
                  style={[
                    GlobalStyles.description,
                    {
                      color:
                        this.state.solAddress.length > 0
                          ? '#00e599'
                          : '#db00ff',
                    },
                  ]}>
                  {this.state.solAddress.length > 0
                    ? 'Seed Vault connected correctly'
                    : 'Not connected yet...'}
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
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#00e59933' : '#00e599',
                    },
                  ]}
                  onPress={async () => {
                    if (this.state.flag) {
                      this.setState({
                        step: 1,
                        flag: false,
                        loading: false,
                      });
                    } else {
                      await this.setStateAsync({
                        loading: true,
                      });
                      this.connectWallet();
                    }
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    {this.state.flag
                      ? 'Continue'
                      : this.state.loading
                      ? 'Connecting Wallet...'
                      : 'Connect Wallet'}
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
          {this.state.step === 1 && (
            <React.Fragment>
              <View
                style={{
                  flex: 10,
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <Text style={GlobalStyles.title}>
                  ETH Secret Recovery Phrase
                </Text>
                <Text style={GlobalStyles.description}>
                  This is the only way you will be able to recover your wallet.
                  Please store it somewhere safe!
                </Text>
                <View
                  style={{
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'stretch',
                  }}>
                  {this.state.mnemonic !== '• • • • • • • • • • • •' &&
                    this.state.mnemonic.split(' ').map((item, index) => (
                      <React.Fragment key={'seed:' + index}>
                        <View style={GlobalStyles.mnemonicBoxStyle}>
                          <Text
                            style={{margin: 10, fontSize: 14, color: 'white'}}>
                            {`${index + 1} | `}
                            {item}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))}
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
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#00e59933' : '#00e599',
                    },
                  ]}
                  onPress={async () => {
                    if (this.state.flag) {
                      this.setState({
                        step: 2,
                        flag: false,
                        loading: false,
                      });
                    } else {
                      await this.setStateAsync({
                        loading: true,
                      });
                      setTimeout(() => {
                        this.createWallet();
                      }, 100);
                    }
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    {this.state.flag
                      ? 'Continue'
                      : this.state.loading
                      ? 'Creating Wallet...'
                      : 'Create Wallet'}
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

export default SetupSeedVaultWallet;
