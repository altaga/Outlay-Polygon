import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import backImage from '../../assets/backgrounds/backgroundSettings.png';
import ETH from '../../assets/eth.png';
import Circle from '../../assets/circle.png';
import Jupiter from '../../assets/jupiter.png';
import Stripe from '../../assets/stripe.png';
import Wormhole from '../../assets/wormHole.png';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import AiIcon from '../../assets/ai.png';

const size = 60;

export const settingsIcons = flag => {
  return {
    email: (
      <Fontisto
        name="email"
        size={size}
        color={flag ? '#db00ff' : '#db00ff33'}
      />
    ),
    print: (
      <MaterialCommunityIcons
        name="receipt"
        size={size}
        color={flag ? '#db00ff' : '#db00ff33'}
      />
    ),
    eth: (
      <Image
        resizeMode="contain"
        source={ETH}
        alt="ETH"
        style={{
          width: size,
          height: size,
          opacity: flag ? 1 : 6 / 15,
        }}
      />
    ),
    jupiter: (
      <Image
        resizeMode="contain"
        source={Jupiter}
        alt="jupiter"
        style={{
          width: size,
          height: size,
          opacity: flag ? 1 : 6 / 15,
        }}
      />
    ),
    tipping: (
      <FontAwesome6
        name="coins"
        size={size}
        color={flag ? '#db00ff' : '#db00ff33'}
      />
    ),
    crosschain: (
      <Image
        resizeMode="contain"
        source={Wormhole}
        alt="Wormhole"
        style={{
          width: size,
          height: size,
          opacity: flag ? 1 : 6 / 15,
        }}
      />
    ),
    fiat: (
      <Image
        resizeMode="contain"
        source={Stripe}
        alt="Stripe"
        style={{
          width: size,
          height: size,
          opacity: flag ? 1 : 6 / 15,
        }}
      />
    ),
    aa: (
      <FontAwesome6
      name="file-contract"
      size={size}
      color={flag ? '#db00ff' : '#db00ff33'}
    />
    ),
    circlePW: (
      <Image
      resizeMode="contain"
      source={Circle}
      alt="Circle"
      style={{
        width: size,
        height: size,
        opacity: flag ? 1 : 6 / 15,
      }}
    />
    )
  };
};

export const settingsNames = {
  email: 'Email',
  print: 'Printer',
  eth: 'EVM',
  jupiter: 'Jupiter',
  tipping: 'Tipping',
  crosschain: 'Wormhole',
  fiat: 'Stripe',
  aa:`Account\nAbstraction`,
  circlePW:"Programable\nWallet"
};

export const settingsDescription = {
  email: 'Send email receipt',
  print: 'Print receipts (recommended for POS devices with a built-in printer)',
  eth: 'Asset management in EVM compatible networks (Arbitrum, Avalanche, BSC, Base, Ethereum, Neon, Optimism and Polygon)',
  jupiter: 'Asset conversion during payment through Solana Pay',
  tipping:
    'Create a payment request link and enable it to receive one-time payments',
  crosschain: 'Allows payments across different blockchain networks',
  fiat: 'Accept Credit Cards and other Traditional Finance payments via Stripe',
  aa:"Boosts your wallet power and security without sharing your private keys (Arbitrum, Base, Ethereum, Optimism and Polygon)",
  circlePW:"Scale transactions effortlessly with Circle wallet as a service solution"
};

export const settingsAvailable = {
  email: false,
  print: true,
  eth: true,
  jupiter: true,
  tipping: true,
  crosschain: true,
  fiat: true,
  aa:true,
  circlePW:true,
};

export const settingsVisible = {
  email: false,
  print: true,
  eth: true,
  jupiter: true,
  tipping: true,
  crosschain: true,
  fiat: true,
  aa:true,
  circlePW:true,
};

class Settings extends Component {
  constructor(props) {
    super(props);
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async componentDidMount() {
    //this.erase() // DEBUG ONLY
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState({
        settings: this.context.value.settings,
      });
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

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <ImageBackground
          style={[GlobalStyles.imageBackground]}
          imageStyle={{
            opacity: 0.3,
          }}
          source={backImage}
          resizeMode="cover">
          <Pressable
            onPress={() => this.props.navigation.navigate('Ai')}
            style={[GlobalStyles.settingsIcon, {padding: 10}]}>
            <Image
              resizeMode="contain"
              source={AiIcon}
              alt="Ai"
              style={{
                width: 30,
                height: 30,
              }}
            />
          </Pressable>
          <SafeAreaView
            style={{
              height: '15%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={[GlobalStyles.title, {marginVertical: 20}]}>
              Setup Modules
            </Text>
          </SafeAreaView>
          <SafeAreaView
            style={{
              height: '70%',
            }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                width: '100%',
                alignItems: 'center',
                showsVerticalScrollIndicator: false,
              }}>
              {Object.keys(this.context.value.settings).map((item, index) =>
                settingsVisible[item] ? (
                  <View
                    key={'Module:' + index}
                    style={[
                      GlobalStyles.modulePressable,
                      {
                        justifyContent: 'space-around',
                        width: Dimensions.get('window').width * 0.9,
                      },
                    ]}>
                    <View
                      style={{
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                      }}>
                      {settingsIcons(settingsAvailable[item])[item]}
                      <Text
                        style={{
                          color: settingsAvailable[item] ? 'white' : 'gray',
                          marginTop: 6,
                          textAlign:"center"
                        }}>
                        {settingsNames[item]}
                      </Text>
                      {!settingsAvailable[item] && (
                        <Text
                          style={{
                            color: '#00e599',
                            marginTop: 6,
                            fontSize: 20,
                          }}>
                          SOON!
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        color: settingsAvailable[item] ? 'white' : 'gray',
                        flexShrink: 1,
                        width: '50%',
                        textAlign: 'center',
                        fontSize: 16,
                      }}>
                      {settingsDescription[item]}
                    </Text>
                    <Switch
                      disabled={!settingsAvailable[item]}
                      trackColor={{false: '#3e3e3e', true: '#db00ff77'}}
                      thumbColor={
                        this.context.value.settings[item]
                          ? '#db00ff'
                          : '#3e3e3e'
                      }
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={e => {
                        let temp = {};
                        temp[item] = e;
                        this.context.setValue({
                          settings: {
                            ...this.context.value.settings,
                            ...temp,
                          },
                        });
                      }}
                      value={this.context.value.settings[item]}
                    />
                  </View>
                ) : (
                  <React.Fragment key={'Module:' + index} />
                ),
              )}
            </ScrollView>
          </SafeAreaView>
          <SafeAreaView
            style={{
              height: '15%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Pressable
              style={[GlobalStyles.buttonStyle, {borderColor: '#00e599'}]}
              onPress={async () => {
                await this.setAsyncStorageValue({
                  settings: this.context.value.settings,
                });
                this.props.navigation.navigate('Main');
              }}>
              <Text style={[GlobalStyles.buttonTextStyle]}>Save and Close</Text>
            </Pressable>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default Settings;
