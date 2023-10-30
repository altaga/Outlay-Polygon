import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import backImage from '../../assets/backgrounds/backgroundMain.png';
import Circle from '../../assets/circle.png';
import ETHIcon from '../../assets/eth.png';
import Jupiter from '../../assets/jupiter.png';
import SolanaIcon from '../../assets/solanaIcon.png';
import SolanaPay from '../../assets/solanaPayButton.png';
import Stripe from '../../assets/stripe.png';
import Wormhole from '../../assets/wormHole.png';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import BalancesBlockchainETH from './tabs/balancesBlockchainEth';
import BalancesBlockchainSOL from './tabs/balancesBlockchainSol';
import BalancesTradiFi from './tabs/balancesFiat';
import Transactions from './tabs/transactions';

const baseMain = {
  tab: 0,
};

const ratio = Dimensions.get('window').height / Dimensions.get('window').width;

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = baseMain;
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
    });
    this.props.navigation.addListener('blur', async () => {
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
          <Pressable
            onPress={() => this.props.navigation.navigate('Settings')}
            style={GlobalStyles.settingsIcon}>
            <Ionicons name="settings-outline" size={30} color={'#db00ff'} />
          </Pressable>
          {this.state.tab === 0 && (
            <SafeAreaView
              style={{
                position: 'absolute',
                top: ratio < 1.78 ? '15%' : '10%',
                height: ratio < 1.78 ? '70%' : '75%',
              }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  width: '100%',
                  alignItems: 'center',
                  showsVerticalScrollIndicator: false,
                }}>
                <Pressable
                  onPress={() => this.props.navigation.navigate('SolanaPay')}
                  style={GlobalStyles.modulePressable}>
                  <Image
                    resizeMode="contain"
                    source={SolanaPay}
                    alt="SolanaPayIcon"
                    style={{
                      width: 100,
                      height: 100,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      color: 'white',
                      flexShrink: 1,
                      width: '50%',
                      textAlign: 'center',
                      fontSize: 18,
                    }}>
                    Create a Solana Pay QR
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    this.props.navigation.navigate('DirectTransfer')
                  }
                  style={GlobalStyles.modulePressable}>
                  <AntDesign
                    name="qrcode"
                    style={{marginRight: 10}}
                    size={100}
                    color={'#db00ff'}
                  />
                  <Text
                    style={{
                      color: 'white',
                      flexShrink: 1,
                      width: '50%',
                      textAlign: 'center',
                      fontSize: 18,
                    }}>
                    Direct transfer via static QR
                  </Text>
                </Pressable>
                {this.context.value.settings.jupiter && (
                  <Pressable
                    onPress={() =>
                      this.props.navigation.navigate('SolanaPayJupiter')
                    }
                    style={GlobalStyles.modulePressable}>
                    <Image
                      resizeMode="contain"
                      source={Jupiter}
                      alt="Jupiter"
                      style={{
                        width: 100,
                        height: 100,
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: 'white',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Accept any SPL token using Jupiter
                    </Text>
                  </Pressable>
                )}
                {this.context.value.settings.tipping && (
                  <Pressable
                    onPress={() => this.props.navigation.navigate('Tipping')}
                    style={GlobalStyles.modulePressable}>
                    <FontAwesome6
                      name="coins"
                      style={{marginRight: 10}}
                      size={100}
                      color={'#db00ff'}
                    />
                    <Text
                      style={{
                        color: 'white',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Shareable tipping links
                    </Text>
                  </Pressable>
                )}
                {this.context.value.settings.crosschain && (
                  <Pressable
                    onPress={() => this.props.navigation.navigate('Wormhole')}
                    style={GlobalStyles.modulePressable}>
                    <Image
                      resizeMode="contain"
                      source={Wormhole}
                      alt="Wormhole"
                      style={{
                        width: 100,
                        height: 100,
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: 'white',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Cross-chain Payment powered by Wormhole
                    </Text>
                  </Pressable>
                )}
                {this.context.value.settings.fiat && (
                  <Pressable
                    onPress={() => this.props.navigation.navigate('TradiFi')}
                    style={GlobalStyles.modulePressable}>
                    <Image
                      resizeMode="contain"
                      source={Stripe}
                      alt="Stripe"
                      style={{
                        width: 100,
                        height: 100,
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: 'white',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Traditional Finance Payment powered by Stipe (TESTNET)
                    </Text>
                  </Pressable>
                )}
                {this.context.value.settings.aa && (
                  <Pressable
                    onPress={() => this.props.navigation.navigate('AA')}
                    style={GlobalStyles.modulePressable}>
                      <FontAwesome6
                      name="file-contract"
                      style={{marginRight: 10}}
                      size={100}
                      color={'#db00ff'}
                    />
                    <Text
                      style={{
                        color: 'white',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Enhanced wallet security no private key-sharing
                    </Text>
                  </Pressable>
                )}
                {this.context.value.settings.circlePW && (
                  <Pressable
                    onPress={() => this.props.navigation.navigate('CircleProgrammableWallet')}
                    style={GlobalStyles.modulePressable}>
                    <Image
                      resizeMode="contain"
                      source={Circle}
                      alt="Circle"
                      style={{
                        width: 100,
                        height: 100,
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: 'white',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      Enhanced wallet security powered by Circle (TESTNET)
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
            </SafeAreaView>
          )}
          {this.state.tab === 1 && (
            <SafeAreaView
              style={{
                position: 'absolute',
                top: ratio < 1.78 ? '15%' : '10%',
                height: ratio < 1.78 ? '70%' : '75%',
              }}>
              <BalancesBlockchainSOL navigation={this.props.navigation} />
            </SafeAreaView>
          )}
          {this.state.tab === 2 && (
            <SafeAreaView
              style={{
                position: 'absolute',
                top: ratio < 1.78 ? '15%' : '10%',
                height: ratio < 1.78 ? '70%' : '75%',
              }}>
              <BalancesBlockchainETH navigation={this.props.navigation} />
            </SafeAreaView>
          )}
          {this.state.tab === 3 && (
            <SafeAreaView
              style={{
                position: 'absolute',
                top: ratio < 1.78 ? '15%' : '10%',
                height: ratio < 1.78 ? '70%' : '75%',
              }}>
              <BalancesTradiFi />
            </SafeAreaView>
          )}
          {this.state.tab === 4 && (
            <SafeAreaView
              style={{
                position: 'absolute',
                top: ratio < 1.78 ? '15%' : '10%',
                height: ratio < 1.78 ? '70%' : '75%',
              }}>
              <Transactions />
            </SafeAreaView>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '15%',
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              borderColor: '#00e599',
              borderWidth: 2,
              borderBottomWidth: 0,
              backgroundColor: '#000000',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <Pressable
              onPress={() =>
                this.setState({
                  tab: 0,
                })
              }>
              <Ionicons
                name="home-outline"
                size={30}
                color={this.state.tab === 0 ? '#db00ff' : '#db00ff55'}
              />
            </Pressable>
            <Pressable
              onPress={() =>
                this.setState({
                  tab: 1,
                })
              }>
              <Image
                resizeMode="contain"
                source={SolanaIcon}
                alt="SolanaIcon"
                style={{
                  width: 30,
                  height: 30,
                  opacity: this.state.tab === 1 ? 1 : 6 / 15,
                }}
              />
            </Pressable>
            {this.context.value.settings.eth && (
              <Pressable
                onPress={() =>
                  this.setState({
                    tab: 2,
                  })
                }>
                <Image
                  resizeMode="contain"
                  source={ETHIcon}
                  alt="ETHIcon"
                  style={{
                    width: 30,
                    height: 30,
                    opacity: this.state.tab === 2 ? 1 : 6 / 15,
                  }}
                />
              </Pressable>
            )}
            {this.context.value.settings.fiat && (
              <Pressable
                onPress={() =>
                  this.setState({
                    tab: 3,
                  })
                }>
                <Image
                  resizeMode="contain"
                  source={Stripe}
                  alt="Stripe"
                  style={{
                    width: 30,
                    height: 30,
                    opacity: this.state.tab === 3 ? 1 : 6 / 15,
                  }}
                />
              </Pressable>
            )}
            <Pressable
              onPress={() =>
                this.setState({
                  tab: 4,
                })
              }>
              <MaterialIcons
                name="receipt-long"
                size={30}
                color={this.state.tab === 4 ? '#db00ff' : '#db00ff55'}
              />
            </Pressable>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default Main;
