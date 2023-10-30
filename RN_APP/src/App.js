import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import {StatusBar} from 'react-native';
// Utils
import DirectTransfer from './screens/DirectTransfer/directTransfer';
import Main from './screens/Main/main';
import Settings from './screens/Settings/settings';
import Setup from './screens/Setup/setup';
import SetupImportWallet from './screens/SetupImportWallet/setupImportWallet';
import SetupNewWallet from './screens/SetupNewWallet/setupNewWallet';
import SetupSeedVaultWallet from './screens/SetupSeedVaultWallet/setupSeedVaultWallet';
import SetupWatchWallet from './screens/SetupWatchWallet/setupWatchWallet';
import SplashLoading from './screens/SplashLoading/splashLoading';
import {ContextProvider} from './utils/contextModule';
import SolanaPay from './screens/SolanaPay/solanaPay';
import StripeTransfer from './screens/TradiFi/tradifi';
import SolanaPayJupiter from './screens/SolanaPayJupiter/solanaPayJupiter';
import Tipping from './screens/Tipping/tipping';
import TippingForm from './screens/TippingForm/tippingForm';
import {initializeSslPinning} from 'react-native-ssl-public-key-pinning';
import AiSelector from './screens/Ai/ai';
import WormholeComponent from './screens/Wormhole/wormholeComponent';
import TransferSOL from './screens/TransferSOL/transferSOL';
import TransferETH from './screens/TransferETH/transferETH';
import AccountAbstraction from './screens/AccountAbstraction/aa';
import CircleProgrammableWallet from './screens/ProgramableWallet/cpw';

const Stack = createNativeStackNavigator();

class App extends React.Component {
  async componentDidMount() {
    await initializeSslPinning({
      'outlay.site': {
        includeSubdomains: true,
        publicKeyHashes: ['EgtQNAGHuvr0nI47LrdAebfgdzewnXI2dBrdyItJGCc='], // PubKey Pinning
      },
      'api.outlay.site': {
        includeSubdomains: true,
        publicKeyHashes: ['9OM2jp3TlealIQd1NzgkBUerOKv42b4WeUrQXmA7iks=='], // PubKey Pinning
      },
      'api.helius.xyz': {
        publicKeyHashes: ['4X8PdsHp131w6db1sCbsUDRSBF8jd4D6I1mBhdvCCmY='], // PubKey Pinning
      },
      'quote-api.jup.ag': {
        includeSubdomains: true,
        publicKeyHashes: ['Q8YW+ujmFoB8gV5ylFaxAzpFTIIwWyTftmJoQKBwPBE='], // PubKey Pinning
      },
      'stripe.com': {
        includeSubdomains: true,
        publicKeyHashes: ['dRGblydbqCtAhU7ZyIwqKSs8D/Zkj6Kv8YO8Ug2gANw='], // PubKey Pinning
      },
      'raw.githubusercontent.com': {
        includeSubdomains: true,
        publicKeyHashes: ['qlJvUaRP4/Oodg/x84EZ52Ulu8y9eUHh++IjI8zJ2bc='], // PubKey Pinning
      },
      'github.com': {
        includeSubdomains: true,
        publicKeyHashes: ['jSd+RbSAB3215SSioJKeyfdEFELVT/xz+Fwod2ypqtE='], // PubKey Pinning
      },
    });
    console.log('SSL Pinning OK');
  }
  render() {
    return (
      <ContextProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" />
          <Stack.Navigator
            initialRouteName="SplashLoading"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="SplashLoading" component={SplashLoading} />
            {
              // Setups
            }
            <Stack.Screen name="Setup" component={Setup} />
            <Stack.Screen name="SetupNewWallet" component={SetupNewWallet} />
            <Stack.Screen
              name="SetupImportWallet"
              component={SetupImportWallet}
            />
            <Stack.Screen
              name="SetupWatchWallet"
              component={SetupWatchWallet}
            />
            <Stack.Screen
              name="SetupSeedVaultWallet"
              component={SetupSeedVaultWallet}
            />

            {
              // Main
            }
            <Stack.Screen name="Settings" component={Settings} />
            {
              // Main
            }
            <Stack.Screen name="Main" component={Main} />
            {
              // Modules
            }
            <Stack.Screen name="SolanaPay" component={SolanaPay} />
            <Stack.Screen name="DirectTransfer" component={DirectTransfer} />
            <Stack.Screen
              name="SolanaPayJupiter"
              component={SolanaPayJupiter}
            />
            <Stack.Screen name="Tipping" component={Tipping} />
            <Stack.Screen name="TippingForm" component={TippingForm} />
            <Stack.Screen name="TradiFi" component={StripeTransfer} />
            <Stack.Screen name="Wormhole" component={WormholeComponent} />
            <Stack.Screen name="Ai" component={AiSelector} />
            <Stack.Screen name="AA" component={AccountAbstraction} />
            <Stack.Screen
              name="CircleProgrammableWallet"
              component={CircleProgrammableWallet}
            />
            {
              // OtherComponents
            }
            <Stack.Screen name="TransferSOL" component={TransferSOL} />
            <Stack.Screen name="TransferETH" component={TransferETH} />
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    );
  }
}

export default App;
