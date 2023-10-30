import {HeliusAPI} from '@env';
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
import backImage from '../../assets/backgrounds/backgroundModules.png';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import {Connection, PublicKey} from '@solana/web3.js';
import {findReference} from '@solana/pay';

class Tipping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pending: [],
    };
    reactAutobind(this);
    this.connection = new Connection(
      `https://rpc.helius.xyz/?api-key=${HeliusAPI}`,
      'confirmed',
    );
    this.interval = [];
  }

  static contextType = ContextModule;

  async componentDidMount() {
    //this.erase() // DEBUG ONLY
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      let pending = (await this.getAsyncStorageValue('pending')) ?? [];
      await this.setStateAsync({
        pending,
      });
      console.log(pending);
      this.circularCheck();
      /*
      pending = []
      this.setAsyncStorageValue({
        pending
      })
      */
    });
    this.props.navigation.addListener('blur', async () => {
      this.interval.length > 0 &&
        this.interval.map((item, index) => clearInterval(this.interval[index]));
    });
  }

  componentWillUnmount() {
    this.interval.length > 0 &&
      this.interval.map((item, index) => clearInterval(this.interval[index]));
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

  circularCheck() {
    const delay = 1000;
    this.state.pending.map((item, index) =>
      setTimeout(async () => {
        const {reference, status} = this.state.pending[index];
        if (status === 'Validated') {
          console.log(`${reference}:Validated`);
        } else {
          const temp = await this.findReference(new PublicKey(reference));
          if (temp) {
            let {pending} = this.state;
            pending[index] = {
              reference,
              status: 'Validated',
            };
            this.setState({
              pending,
            });
          } else {
            console.log(`${reference}:Pending...`);
          }
        }
      }, delay * index),
    );
    this.state.pending.map(
      (item, index) =>
        (this.interval[index] = setInterval(async () => {
          setTimeout(async () => {
            const {reference, status} = this.state.pending[index];
            if (status === 'Validated') {
              console.log(`${reference}:Validated`);
            } else {
              const temp = await this.findReference(new PublicKey(reference));
              if (temp) {
                let {pending} = this.state;
                pending[index] = {
                  reference,
                  status: 'Validated',
                };
                this.setState({
                  pending,
                });
              } else {
                console.log(`${reference}:Pending...`);
              }
            }
          }, delay * index);
        }, this.state.pending.length * delay)),
    );
  }

  async findReference(reference) {
    try {
      await findReference(this.connection, reference, {
        finality: 'confirmed',
      });
      return true;
    } catch {
      return false;
    }
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
          <SafeAreaView
            style={{
              flex: 1,
              justifyContent: 'space-around',
              alignItems: 'center',
              width: Dimensions.get('window').width,
            }}>
            <View
              style={{
                flex: 2,
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%',
              }}>
              <Text style={[GlobalStyles.textInput, {marginTop: 20}]}>
                Tipping Links
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
                onPress={async () => {
                  this.props.navigation.navigate('TippingForm');
                }}>
                <Text style={[GlobalStyles.buttonTextStyle]}>
                  Create New Payment
                </Text>
              </Pressable>
              <View
                style={{
                  height: 3,
                  width: '80%',
                  backgroundColor: '#00e599',
                  marginTop: 20,
                  borderRadius: 3,
                }}
              />
            </View>
            <View
              style={{
                flex: 8,
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%',
              }}>
              <Text style={[GlobalStyles.textInput, {marginTop: 20}]}>
                Pending Payments
              </Text>
              <ScrollView
              showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  width: '100%',
                  alignItems: 'center',
                  showsVerticalScrollIndicator: false,
                }}>
                {this.state.pending.length > 0 ? (
                  this.state.pending.map((item, index) => (
                    <View
                      key={'pendings:' + index}
                      style={[
                        GlobalStyles.modulePressable,
                        {
                          justifyContent: 'space-around',
                          width: Dimensions.get('window').width * 0.9,
                          marginVertical: 20,
                          padding: 0,
                        },
                      ]}>
                      <View
                        style={{
                          width: '50%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          margin: 10,
                        }}>
                        <Text
                          style={[GlobalStyles.description, {color: 'white'}]}>
                          Reference:
                        </Text>
                        <Text style={[GlobalStyles.description]}>
                          {item.reference.substring(0, 5)}
                          {'...'}
                          {item.reference.substring(
                            item.reference.length - 5,
                            item.reference.length,
                          )}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '50%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          margin: 10,
                        }}>
                        <Text
                          style={[GlobalStyles.description, {color: 'white'}]}>
                          Live Status:
                        </Text>
                        <Text
                          style={[
                            GlobalStyles.description,
                            {
                              color:
                                item.status === 'Validated' ? 'green' : 'red',
                            },
                          ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[GlobalStyles.description, {margin: 20}]}>
                    No pending payments...
                  </Text>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default Tipping;
