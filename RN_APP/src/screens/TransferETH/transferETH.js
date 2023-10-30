import {BigNumber, Contract, Wallet, providers, utils} from 'ethers';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import Tick from '../../assets/tick.png';
import GlobalStyles, {StatusBarHeight} from '../../styles/styles';
import Cam from '../../utils/cam';
import {AccountAbstractionEVMs, EVMs} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {abiLightAccount} from '../../programs/contractsETH/LightAccount';

const baseTransferETH = {
  stage: 0, //""
  ethAddress: '', // ""
  signature: '',
  reset: false,
  loading: false,
  amount: '',
  network: EVMs[0],
  aa: null,
  fromAA: false,
};

class TransferETH extends Component {
  constructor(props) {
    super(props);
    this.state = baseTransferETH;
    reactAutobind(this);
    this.svg = null;
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

  async checkAA(network) {
    const addresses =
      (await this.getAsyncStorageValue('addresses')) ??
      AccountAbstractionEVMs.map(() => '0x');
    let temp = [];
    addresses.forEach((item, index) => {
      if (item !== '0x') {
        temp.push({
          address: item,
          network: AccountAbstractionEVMs[index].network,
        });
      }
    });
    const aaAvailable =
      temp.filter(item => item.network === network).length > 0
        ? temp.filter(item => item.network === network)[0]
        : null;
    this.setState({
      aa: aaAvailable,
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

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      const {network} = this.props.route.params;
      console.log(this.props.route.name);
      await this.setStateAsync({
        ...baseTransferETH,
        network: EVMs[network],
      });
      this.resetCam();
      this.checkAA(EVMs[network].network);
    });
    this.props.navigation.addListener('blur', async () => {
      await this.setStateAsync(baseTransferETH);
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

  async getBalance(rpc, address) {
    const provider = new providers.JsonRpcProvider(rpc);
    const balance = await provider.getBalance(address);
    return utils.formatEther(balance);
  }

  async send() {
    const provider = new providers.JsonRpcProvider(this.state.network.rpc);
    const gasPrice = await provider.getGasPrice();
    const nonce = await provider.getTransactionCount(
      this.context.value.ethAddress,
    );
    let transaction = {
      chainId: this.state.network.chainId,
      to: this.state.ethAddress,
      value: utils.parseUnits(this.state.amount, 'ether'),
      gasPrice,
      nonce,
    };
    const gas = await provider.estimateGas(transaction);
    transaction = {...transaction, gasLimit: gas};
    const session = await this.getEncryptStorageValue('ethPrivate');
    const wallet = new Wallet(session);
    const serializedSignedTx = await wallet.signTransaction(transaction);
    const {hash} = await provider.sendTransaction(serializedSignedTx);
    await provider.waitForTransaction(hash);
    this.setState({
      signature: hash,
      stage: 2,
      loading: false,
    });
  }

  async sendAA() {
    const provider = new providers.JsonRpcProvider(this.state.network.rpc);
    const session = await this.getEncryptStorageValue('ethPrivate');
    const wallet = new Wallet(session, provider);
    const gasPrice = await provider.getGasPrice();
    const accountAbstraction = new Contract(
      this.state.aa.address,
      abiLightAccount,
      wallet,
    );
    const balance = await this.getBalance(this.state.network.rpc,this.state.aa.address)
    console.log(balance)
    console.log(utils.formatEther(utils.parseUnits(this.state.amount, 'ether')))
    const gas = await accountAbstraction.estimateGas.execute(
      this.state.ethAddress,
      utils.parseUnits(this.state.amount, 'ether'),
      "0x"
    );
    console.log(gas)
    const gasLimit = gas.mul(BigNumber.from(2));
    let receipt = await accountAbstraction.execute(
      this.state.ethAddress,
      utils.parseUnits(this.state.amount, 'ether'),
      "0x",
      {
        gasLimit,
        gasPrice,
      },
    );
    const signature = receipt.hash
    console.log(receipt);
    receipt = await receipt.wait();
    console.log(receipt);
    this.setState({
      signature,
      stage: 2,
      loading: false,
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
                  {`Scan Address (Send ${this.state.network.nativeToken})`}
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
                    callbackAddressETH={ethAddress =>
                      this.setState({
                        ethAddress,
                        stage: 1,
                      })
                    }
                    callbackAddress={() => this.resetCam()}
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
                  Ethereum Address
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
                  value={this.state.ethAddress}
                  onChangeText={ethAddress => this.setState({ethAddress})}
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
                  Native Token
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
                  {this.state.network.nativeToken}
                </Text>
                {this.context.value.settings.aa && (
                  <View
                    style={{
                      width: Dimensions.get('screen').width,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      marginTop: 20,
                    }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        textAlignVertical: 'center',
                      }}>
                      {'From Smart\nContract Wallet'}
                    </Text>
                    <Switch
                      onChange={() =>
                        this.setState({
                          fromAA: !this.state.fromAA,
                        })
                      }
                      value={this.state.fromAA}
                      thumbColor={this.state.fromAA ? '#00ffa9' : '#008055'}
                      trackColor={'#00e59955'}
                    />
                  </View>
                )}
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
                    this.state.fromAA ? this.sendAA() : this.send();
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
                          `${this.state.network.blockExplorer}tx/${this.state.signature}`,
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

export default TransferETH;
