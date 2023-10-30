
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {Dimensions, Pressable, SafeAreaView, ScrollView, Text, View} from 'react-native';
import GlobalStyles from '../../../styles/styles';
import {EVMs} from '../../../utils/constants';
import ContextModule from '../../../utils/contextModule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { providers, utils } from 'ethers';

const marginBottom = 20;

function arrayToObject(array) {
  let temp = {};
  array.forEach(item => {
    temp[item.chainId] = '0.0';
  });
  return temp;
}

function arrayToObject2(array) {
  let temp = {};
  array.forEach(item => {
    temp[Object.keys(item)[0]] = Object.values(item)[0];
  });
  return temp;
}

class BalancesBlockchainETH extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balances: arrayToObject(EVMs),
    };
    reactAutobind(this);
    this.counter = 1;
    this.reference = 0;
  }

  static contextType = ContextModule;

  async getBalance(network) {
    const {rpc, chainId} = network;
    const provider = new providers.JsonRpcProvider(rpc);
    const balance = await provider.getBalance(this.context.value.ethAddress);
    let temp = {};
    temp[chainId] = utils.formatEther(balance);
    return temp;
  }

  async getBalances() {
    const balances = await Promise.all(EVMs.map(item => this.getBalance(item)));
    this.setState({balances: arrayToObject2(balances)});
    this.setAsyncStorageValue({
      balancesETH: arrayToObject2(balances),
    });
  }

  async componentDidMount() {
    const balances =
      (await this.getAsyncStorageValue('balancesETH')) ?? this.state.balances;
    await this.setStateAsync({balances});
    this.getBalances();
  }

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

  tapCounter(reference) {
    if (this.reference === reference) {
      if (this.counter === 2) {
        this.counter = 0;
        this.props.navigation.navigate("TransferETH",{
          network:reference
        })
      }
      this.counter++;
    } else {
      this.reference = reference;
      this.counter = 2;
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
        showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: '100%',
            alignItems: 'center',
            showsVerticalScrollIndicator: false,
          }}>
          {EVMs.map((network, index) => (
            <Pressable
            onPress={() => (this.context.value.kind === 0 || this.context.value.kind === 2) && this.tapCounter(index)}
              key={'EVMS:' + index}
              style={[
                GlobalStyles.assetStyle,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  width: Dimensions.get('window').width * 0.9,
                  borderColor: '#db00ff',
                  marginBottom,
                },
              ]}>
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '50%',
                }}>
                {network.icon}
                <Text style={{color: 'white'}}>{network.network}</Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '50%',
                }}>
                <Text style={{color: 'white'}}>{`${
                  epsilonRound(parseFloat(this.state.balances[network.chainId]),6)
                }`}</Text>
                <Text style={{color: 'white'}}>{network.nativeToken}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default BalancesBlockchainETH;
