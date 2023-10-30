import AsyncStorage from '@react-native-async-storage/async-storage';
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
import GlobalStyles from '../../styles/styles';
import {ProgrammableWalletsEVMs} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import {CIRCLE_BEARER, WALLET_SET_ID} from '@env';

const baseCircleProgrammableWalletState = {
  addresses: ProgrammableWalletsEVMs.map(() => ({})),
  amount: ProgrammableWalletsEVMs.map(() => 0),
  loading: false,
};

class CircleProgrammableWallet extends Component {
  constructor(props) {
    super(props);
    this.state = baseCircleProgrammableWalletState;
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async createProgrammableWallet(index, chainId) {
    const entitySecretCiphertext = await new Promise(resolve =>
      fetch('https://api.outlay.site/circle-forge', {
        method: 'GET',
        redirect: 'follow',
      })
        .then(response => response.text())
        .then(res => resolve(res))
        .catch(() => resolve('')),
    );
    const wallet = await new Promise(resolve => {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', CIRCLE_BEARER);
      var raw = JSON.stringify({
        blockchains: [chainId],
        count: 1,
        entitySecretCiphertext,
        idempotencyKey: UUIDv4.generate(),
        walletSetId: WALLET_SET_ID,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch('https://api.circle.com/v1/w3s/developer/wallets', requestOptions)
        .then(response => response.json())
        .then(result => resolve(result.data.wallets))
        .catch(() => resolve(null));
    });
    wallet && (await this.setWallet(index, wallet[0]));
  }

  async setWallet(index, address) {
    let addresses = this.state.addresses;
    addresses[index] = address;
    await this.setAsyncStorageValue({
      circleAddresses: addresses,
    });
    await this.setStateAsync({
      addresses,
    });
    console.log(addresses);
  }

  async getBalance(walletId) {
    return new Promise(resolve => {
      var myHeaders = new Headers();
      myHeaders.append('Authorization', CIRCLE_BEARER);

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      fetch(
        `https://api.circle.com/v1/w3s/wallets/${walletId}/balances?includeAll=True`,
        requestOptions,
      )
        .then(response => response.json())
        .then(result => resolve(result.data.tokenBalances))
        .catch(error => resolve([]));
    });
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      let addresses =
        (await this.getAsyncStorageValue('circleAddresses')) ??
        ProgrammableWalletsEVMs.map(() => ({}));
      const amount =
        (await this.getAsyncStorageValue('circleAmounts')) ??
        ProgrammableWalletsEVMs.map(() => 0);
      /**
        addresses[0] = {};
        await this.setAsyncStorageValue({
          circleAddresses: addresses,
        });
      */
      await this.setStateAsync({
        ...baseCircleProgrammableWalletState,
        addresses,
        amount,
      });
      this.updateBalances(addresses);
    });
    this.props.navigation.addListener('blur', async () => {});
  }

  componentWillUnmount() {}

  async updateBalances(addresses) {
    let amount = await Promise.all(
      addresses.map(async item => {
        if (Object.keys(item).length === 0) {
          return 0;
        } else {
          return await this.getBalance(item.id);
        }
      }),
    );
    (amount = amount.map(item => {
      try {
        return (
          item.filter(item2 => item2.token.isNative === true)[0]?.amount ?? 0
        );
      } catch {
        return 0;
      }
    })),
      await this.setStateAsync({
        amount,
      });
    await this.setAsyncStorageValue({
      circleAmounts: amount,
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
          <Text
            style={[
              GlobalStyles.textInput,
              {marginVertical: 20, textAlign: 'center'},
            ]}>
            {`Programmable Wallets\n(TESTNET)`}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              width: Dimensions.get('window').width * 0.9,
              alignItems: 'center',
              showsVerticalScrollIndicator: false,
            }}>
            {ProgrammableWalletsEVMs.map((item, index) =>
              Object.keys(this.state.addresses[index]).length === 0 ? (
                <View
                  key={'PWElement:' + index}
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
                      await this.createProgrammableWallet(index, item.chainId);
                      await this.setStateAsync({
                        loading: false,
                      });
                    }}>
                    <Text
                      style={[
                        GlobalStyles.buttonTextStyle,
                        {
                          color: this.state.loading ? '#333' : 'white',
                          textAlign: 'center',
                        },
                      ]}>
                      {`Create Circle\nProgrammable Wallet`}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  key={'PWElement:' + index}
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
                    {this.state.addresses[index].address}
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

export default CircleProgrammableWallet;
