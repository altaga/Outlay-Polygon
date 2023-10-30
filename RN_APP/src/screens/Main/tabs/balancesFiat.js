import {StripeAPI} from '@env';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {SafeAreaView, Text, Dimensions, View, ScrollView} from 'react-native';
import GlobalStyles from '../../../styles/styles';
import ContextModule from '../../../utils/contextModule';
import Icon from 'react-native-vector-icons/Ionicons';

export const customerTest = 'cus_OnUHDLINeM0upZ';

const customer = {
  available: {usd: 0},
  customer: customerTest,
  livemode: false,
  object: 'cash_balance',
  settings: {reconciliation_mode: 'automatic', using_merchant_default: true},
};

const balancesBaseState = {
  customer,
  transactions: [], // []
};

class BalancesTradiFi extends Component {
  constructor(props) {
    super(props);
    this.state = balancesBaseState;
    reactAutobind(this);
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  async getBalances() {
    return new Promise(resolve => {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `${StripeAPI}`);
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        signal: this.controller.signal,
      };
      fetch(
        `https://api.stripe.com/v1/customers/${this.state.customer.customer}/cash_balance`,
        requestOptions,
      )
        .then(response => response.json())
        .then(customer => resolve(customer))
        .catch(() => {
          const _customer = customer;
          resolve(_customer);
        });
    });
  }

  async getTransactions() {
    return new Promise(resolve => {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `${StripeAPI}`);
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        signal: this.controller.signal,
      };
      fetch(
        `https://api.stripe.com/v1/customers/${this.state.customer.customer}/cash_balance_transactions`,
        requestOptions,
      )
        .then(response => response.json())
        .then(transactions => resolve(transactions.data))
        .catch(() => {
          resolve([]);
        });
    });
  }

  async componentDidMount() {
    const customer = await this.getBalances();
    const transactions = await this.getTransactions();
    this.setState({customer,transactions});
  }

  componentWillUnmount() {
    this.controller.abort();
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Text style={[GlobalStyles.title, {fontSize: 24, marginVertical: 20}]}>
          Balances
        </Text>
        <View
          style={[
            GlobalStyles.assetStyle,
            {
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: Dimensions.get('window').width * 0.9,
              borderColor: '#db00ff',
            },
          ]}>
          <View
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '50%',
            }}>
            <Text style={{color: 'white'}}>{'Stripe Balance'}</Text>
          </View>
          <Icon name="logo-usd" size={30} color={'white'} />
          <View
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '50%',
            }}>
            <Text style={{color: 'white'}}>{`${epsilonRound(
              this.state.customer.available.usd / Math.pow(10, 2),
              2,
            )}`}</Text>
            <Text style={{color: 'white'}}>{'USD'}</Text>
          </View>
        </View>
        <Text style={[GlobalStyles.title, {fontSize: 24, marginVertical: 20}]}>
          Transactions
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            showsVerticalScrollIndicator: false,
          }}>
          {this.state.transactions.map((item, index) => (
            <View
              key={'transactions:' + index}
              style={[
                GlobalStyles.assetStyle,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  width: Dimensions.get('window').width * 0.9,
                  borderColor: index % 2 ? '#db00ff' : '#00e599',
                  marginVertical: 10,
                },
              ]}>
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '50%',
                }}>
                  <Text style={{color: 'white'}}>{'Type:'}</Text>
                <Text style={{color: 'white'}}>
                  {
                    item.type.length > 14 ?
                    `${item.type.substring(0,14)}...`
                    :
                    `${item.type}`
                  }
                  </Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '50%',
                }}>
                <Text style={{color: 'white'}}>{'Amount:'}</Text>
                <Text style={{color: 'white'}}>
                  {`${epsilonRound(item.net_amount / Math.pow(10, 2), 2)}`}
                  {' USD'}
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  width: '50%',
                }}>
                  <Text style={{color: 'white'}}>
                  Date:
                </Text>
                <Text style={{color: 'white'}}>
                  {new Date(item.created*1000).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default BalancesTradiFi;
