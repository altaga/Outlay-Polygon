import {BigNumber, Contract, Wallet, providers, utils} from 'ethers';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import {abiLightAccount} from '../../programs/contractsETH/LightAccount';
import {abiLightAccountFactory} from '../../programs/contractsETH/LightAccountFactory';
import GlobalStyles from '../../styles/styles';
import {AccountAbstractionEVMs} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseAAState = {
  addresses: AccountAbstractionEVMs.map(() => '0x'),
  amount: AccountAbstractionEVMs.map(() => 0),
  loading: true,
};

class AccountAbstraction extends Component {
  constructor(props) {
    super(props);
    this.state = baseAAState;
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async componentDidMount() {
    //this.erase() // DEBUG ONLY
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const addresses =
        (await this.getAsyncStorageValue('addresses')) ??
        AccountAbstractionEVMs.map(() => '0x');
      const amount =
        (await this.getAsyncStorageValue('amount')) ??
        AccountAbstractionEVMs.map(() => 0);
      this.setState({
        ...baseAAState,
        addresses,
        amount,
      });
      await this.updateAddresses();
      await this.updateBalances();
      await this.setStateAsync({loading: false});
    });
    this.props.navigation.addListener('blur', async () => {});
  }

  componentWillUnmount() {}

  async updateAddresses() {
    const addresses = await this.fetchAddresses();
    console.log(addresses);
    await this.setStateAsync({
      addresses,
    });
    await this.setAsyncStorageValue({
      addresses,
    });
  }

  async fetchAddresses() {
    const addresses = await Promise.all(
      AccountAbstractionEVMs.map(item =>
        this.checkAA(item.rpc, item.accountAbstractionFactory),
      ),
    );
    return addresses;
  }

  async createAAWallet(rpc, contractAddress) {
    try {
      const provider = new providers.JsonRpcProvider(rpc);
      const session = await this.getEncryptStorageValue('ethPrivate');
      const wallet = new Wallet(session, provider);
      const gasPrice = await provider.getGasPrice();
      console.log(gasPrice);
      const accountAbstractionFactory = new Contract(
        contractAddress,
        abiLightAccountFactory,
        wallet,
      );
      const gas = await accountAbstractionFactory.estimateGas.createAccount(
        this.context.value.ethAddress,
        0,
      );
      const gasLimit = gas.mul(BigNumber.from(2));
      let receipt = await accountAbstractionFactory.createAccount(
        this.context.value.ethAddress,
        0,
        {
          gasLimit,
          gasPrice,
        },
      );
      console.log(receipt);
      receipt = await receipt.wait();
      console.log(receipt);
    } catch (err) {
      console.log(err);
    }
  }

  async updateBalances() {
    const amount = await Promise.all(
      this.state.addresses.map(async (item, index) => {
        if (item === '0x') {
          return 0;
        } else {
          return await this.getBalance(AccountAbstractionEVMs[index].rpc, item);
        }
      }),
    );
    console.log(amount);
    await this.setStateAsync({
      amount,
    });
    await this.setAsyncStorageValue({
      amount,
    });
  }

  async getBalance(rpc, address) {
    const provider = new providers.JsonRpcProvider(rpc);
    const balance = await provider.getBalance(address);
    return utils.formatEther(balance);
  }

  async checkAA(rpc, contractAddress) {
    const provider = new providers.JsonRpcProvider(rpc);
    const accountAbstractionFactory = new Contract(
      contractAddress,
      abiLightAccountFactory,
      provider,
    );
    const address = await accountAbstractionFactory.getAddress(
      this.context.value.ethAddress,
      0,
    );
    const accountAbstraction = new Contract(address, abiLightAccount, provider);
    let owner;
    try {
      owner = await accountAbstraction.owner();
      if (owner === this.context.value.ethAddress) {
        return address;
      } else {
        return '0x';
      }
    } catch {
      return '0x';
    }
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
          <Text style={[GlobalStyles.textInput, {marginVertical: 20}]}>
            Smart Contract Wallets
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              width: Dimensions.get('window').width * 0.9,
              alignItems: 'center',
              showsVerticalScrollIndicator: false,
            }}>
            {AccountAbstractionEVMs.map((item, index) =>
              this.state.addresses[index] === '0x' ? (
                <View
                  key={'AA Element:' + index}
                  style={GlobalStyles.accountAbstraction}>
                  <Text style={[GlobalStyles.title, {fontSize: 20}]}>
                    {item.network}
                  </Text>
                  <View
                    style={{
                      height: 3,
                      width: '90%',
                      backgroundColor: '#00e599',
                      marginVertical: 20,
                      borderRadius: 3,
                    }}
                  />
                  <Pressable
                    disabled={this.state.loading}
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        borderColor: this.state.loading
                          ? '#db00ff33'
                          : '#db00ff',
                        width: '100%',
                      },
                    ]}
                    onPress={async () => {
                      await this.setStateAsync({
                        loading: true,
                      });
                      await this.createAAWallet(
                        item.rpc,
                        item.accountAbstractionFactory,
                      );
                      await this.updateAddresses();
                      await this.updateBalances();
                      await this.setStateAsync({
                        loading: false,
                      });
                    }}>
                    <Text
                      style={[
                        GlobalStyles.buttonTextStyle,
                        {color: this.state.loading ? '#333' : 'white'},
                      ]}>
                      Create AA Wallet
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  key={'AA Element:' + index}
                  style={GlobalStyles.accountAbstraction}>
                  <Text style={[GlobalStyles.title, {fontSize: 20}]}>
                    {item.network}
                    {` `}
                    {item.icon}
                  </Text>
                  <View
                    style={{
                      height: 3,
                      width: '90%',
                      backgroundColor: '#00e599',
                      marginVertical: 20,
                      borderRadius: 3,
                    }}
                  />
                  <Text style={[GlobalStyles.title, {fontSize: 20}]}>
                    {this.state.addresses[index]}
                  </Text>
                  <View
                    style={{
                      height: 3,
                      width: '90%',
                      backgroundColor: '#00e599',
                      marginVertical: 20,
                      borderRadius: 3,
                    }}
                  />
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[GlobalStyles.title, {fontSize: 20}]}>
                      {`Amount:  `}
                      {this.state.amount[index]}
                      {`  `}
                      {item.icon}
                    </Text>
                  </View>
                </View>
              ),
            )}
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default AccountAbstraction;
