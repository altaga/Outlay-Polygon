/**
 * @format
 */

import "node-libs-react-native/globals.js"
import {AppRegistry} from 'react-native';
import App from './src/App';
import Jailbroken from './src/Jailbroken';
import {name as appName} from './app.json';
import JailMonkey from 'jail-monkey'

const flag = false

if (JailMonkey.isJailBroken() && flag) {
    AppRegistry.registerComponent(appName, () => Jailbroken); 
}
else{
   AppRegistry.registerComponent(appName, () => App); 
}
