// Basic Imports
import React, {Component} from 'react';
import {Dimensions, Image, View} from 'react-native';
// Assets
import logo from '../../assets/logo.png';
// Utils
import reactAutobind from 'react-autobind';
import ContextModule from '../../utils/contextModule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {TokenListProvider, ENV} from '@solana/spl-token-registry';
//import RNBootSplash from "react-native-bootsplash";
import GlobalStyles from '../../styles/styles';

// Solana

function checkArray(a, b) {
  return a
    .map(element => {
      let flag = false;
      b.forEach(element2 => {
        if (element === element2) {
          flag = true;
        }
      });
      return flag;
    })
    .every(element => element === true);
}

class SplashLoading extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    reactAutobind(this);
  }

  static contextType = ContextModule;

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

  async getTokenList() {
    return new Promise((resolve, reject) => {
      new TokenListProvider().resolve().then(tokens => {
        resolve(tokens.filterByChainId(ENV.MainnetBeta).getList());
      });
    });
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      // // DEBUG ONLY
      //await this.erase()
      console.log(this.props.route.name);
      const ethAddress = await this.getAsyncStorageValue('ethAddress');
      const solAddress = await this.getAsyncStorageValue('solAddress');
      const kind = await this.getAsyncStorageValue('kind');
      const biometrics = await this.getAsyncStorageValue('biometrics');
      let settings = await this.getAsyncStorageValue('settings');
      const tokens = await this.getTokenList();
      const flag = [ethAddress, solAddress, kind, biometrics, settings].every(
        element => element !== null,
      );
      if (flag) {
        if (
          !checkArray(
            Object.keys(this.context.value.settings),
            Object.keys(settings)
          )
        ) {
          let jsonTemp = {};
          Object.keys(this.context.value.settings).forEach(item => {
            jsonTemp[item] = settings[item] ?? false;
          });
          await this.setAsyncStorageValue({
            settings: jsonTemp,
          });
          settings = jsonTemp
        }
        this.context.setValue({
          ethAddress,
          solAddress,
          kind,
          biometrics,
          tokens,
          settings,
        });
        this.props.navigation.navigate('Main');
        //this.props.navigation.navigate('CircleProgrammableWallet');
      } else {
        // this.props.navigation.navigate('Setup');
        this.props.navigation.navigate('Setup');
      }
    });
    this.props.navigation.addListener('blur', async () => {});
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

  async erase() {
    // Debug Only
    try {
      await EncryptedStorage.clear();
      await AsyncStorage.clear();
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <View style={GlobalStyles.container}>
        <Image
          resizeMode="contain"
          source={logo}
          alt="Cat"
          style={{
            width: Dimensions.get('window').width * 0.4,
          }}
        />
      </View>
    );
  }
}

export default SplashLoading;
