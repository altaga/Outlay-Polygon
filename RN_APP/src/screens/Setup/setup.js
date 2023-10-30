import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import backImage from '../../assets/backgrounds/backgroundSetup.png';
import logo from '../../assets/logo.png';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';

class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
    });
    this.props.navigation.addListener('blur', async () => {});
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <ImageBackground
          style={[GlobalStyles.imageBackground]}
          source={backImage}
          resizeMode="cover">
          <View
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              height: '50%',
            }}>
            <Image
              source={logo}
              alt="Cat"
              style={{
                flex: 2,
                width: Dimensions.get('window').width * 0.5,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 22,
                textAlign: 'center',
                marginHorizontal: 40,
                color: 'white',
                fontFamily: 'DMSans-Medium',
              }}>
              Outlay is a Point of Sale application and SDK powered by AI.
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              height: '50%',
            }}>
            <Pressable
              style={[
                GlobalStyles.buttonStyle,
                {
                  borderColor: '#00e599',
                },
              ]}
              onPress={async () => {
                this.props.navigation.navigate('SetupNewWallet');
              }}>
              <Text style={[GlobalStyles.buttonTextStyle]}>Create Wallet</Text>
            </Pressable>
            <Pressable
              style={[
                GlobalStyles.buttonStyle,
                {
                  borderColor: '#47a6cc',
                },
              ]}
              onPress={async () => {
                this.props.navigation.navigate('SetupImportWallet');
              }}>
              <Text style={[GlobalStyles.buttonTextStyle]}>Import Wallet</Text>
            </Pressable>
            <Pressable
              style={[GlobalStyles.buttonStyle, {borderColor: '#db00ff'}]}
              onPress={async () => {
                this.props.navigation.navigate('SetupWatchWallet');
              }}>
              <Text style={[GlobalStyles.buttonTextStyle]}>
                Watch-only Wallet
              </Text>
            </Pressable>
            {DeviceInfo.getModel().indexOf('Saga') > -1 && (
              <Pressable
                style={[
                  GlobalStyles.buttonStyle,
                  {
                    borderColor: '#ff795a',
                  },
                ]}
                onPress={async () => {
                  this.props.navigation.navigate('SetupSeedVaultWallet');
                }}>
                <Text
                  style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>
                  Connect Wallet (SeedVault)
                </Text>
              </Pressable>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default Setup;
