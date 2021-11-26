import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
require('./nativePackages');

import App from './App';
import { name as appName } from './app.json';

enableScreens();
AppRegistry.registerComponent(appName, () => App);
