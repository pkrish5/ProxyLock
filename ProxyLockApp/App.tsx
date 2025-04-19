/**
 * Proxy Lock App - BLE Advertiser
 * Sends a specific Bluetooth signal to an ESP32 device
 */

import React, {useState, useEffect} from 'react';
import {
  Platform,
  PermissionsAndroid,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to broadcast');
  const [manager] = useState(() => new BleManager());

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  // Request permissions on Android
  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissionsRequired = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ];

        const results = await PermissionsAndroid.requestMultiple(
          permissionsRequired,
        );
        
        let allGranted = true;
        for (const permission of Object.keys(results)) {
          if (results[permission] !== 'granted') {
            allGranted = false;
          }
        }

        if (!allGranted) {
          Alert.alert(
            'Permission Error',
            'Not all required permissions were granted. The app may not function properly.',
          );
        } else {
          setStatusMessage('Permissions granted. Ready to broadcast.');
        }
      } catch (error) {
        console.error('Permission request error:', error);
        setStatusMessage('Failed to request permissions.');
      }
    }
  };

  useEffect(() => {
    // Request permissions on component mount
    requestAndroidPermissions();

    // Clean up on unmount
    return () => {
      if (isBroadcasting) {
        stopBroadcast();
      }
      manager.destroy();
    };
  }, []);

  // Define a specific UUID and manufacturer data
  // This can be used by your ESP32 to identify this specific signal
  const SERVICE_UUID = '11111111-2222-3333-4444-555555555555';
  const MANUFACTURER_DATA = [0xE0, 0x00, // Company ID (0x00E0)
                           0x01, 0x02, 0x03, 0x04]; // Custom data

  const startBroadcast = async () => {
    try {
      // Check if Bluetooth is powered on
      const state = await manager.state();
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not powered on');
      }

      // Start advertising
      await manager.startAdvertising({
        serviceUUIDs: [SERVICE_UUID],
        manufacturerData: Buffer.from(MANUFACTURER_DATA),
      });

      console.log('Broadcast started');
      setIsBroadcasting(true);
      setStatusMessage('Broadcasting signal to ESP32...');
    } catch (error) {
      console.error('Broadcast error:', error);
      setStatusMessage('Failed to start broadcast: ' + error);
      Alert.alert('Error', 'Failed to start broadcasting: ' + error);
    }
  };

  const stopBroadcast = async () => {
    try {
      await manager.stopAdvertising();
      console.log('Broadcast stopped');
      setIsBroadcasting(false);
      setStatusMessage('Broadcast stopped');
    } catch (error) {
      console.error('Failed to stop broadcast:', error);
      setStatusMessage('Failed to stop broadcast: ' + error);
    }
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, {color: isDarkMode ? Colors.white : Colors.black}]}>
            Proxy Lock
          </Text>
          
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, {color: isDarkMode ? Colors.light : Colors.dark}]}>
              This app broadcasts a specific BLE signal that your ESP32 device can detect to trigger 
              a lock/unlock action.
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, {color: isDarkMode ? Colors.light : Colors.dark}]}>
              Status: {statusMessage}
            </Text>
            <Text style={[styles.detailText, {color: isDarkMode ? Colors.light : Colors.dark}]}>
              {isBroadcasting ? 'Broadcasting UUID: ' + SERVICE_UUID : 'Ready to broadcast'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.button,
              isBroadcasting ? styles.stopButton : styles.startButton,
            ]}
            onPress={isBroadcasting ? stopBroadcast : startBroadcast}>
            <Text style={styles.buttonText}>
              {isBroadcasting ? 'Stop Broadcasting' : 'Start Broadcasting'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  infoContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    width: '100%',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
