/**
 * Proxy Lock App - BLE Advertiser
 * Sends a specific Bluetooth signal to an ESP32 device
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
