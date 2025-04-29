import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

const ManageAccessScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Request necessary permissions when component mounts
    const requestPermissions = async () => {
      if (Platform.OS === 'ios') {
        manager.onStateChange((state) => {
          if (state === 'PoweredOn') {
            return;
          }
          if (state === 'PoweredOff') {
            Alert.alert(
              'Bluetooth is Off',
              'Please turn on Bluetooth to use this feature.',
              [{ text: 'OK' }]
            );
          }
        }, true);
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        
        const allGranted = Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          Alert.alert(
            'Permission Required',
            'This app needs Bluetooth and Location permissions to work properly.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    requestPermissions();

    return () => {
      manager.destroy();
    };
  }, []);

  const startScan = () => {
    if (Platform.OS === 'ios') {
      manager.state().then((state) => {
        if (state !== 'PoweredOn') {
          Alert.alert(
            'Bluetooth is Off',
            'Please turn on Bluetooth to use this feature.',
            [{ text: 'OK' }]
          );
          return;
        }
        beginScan();
      });
    } else {
      beginScan();
    }
  };

  const beginScan = () => {
    setScanning(true);
    setDevices([]);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setScanning(false);
        Alert.alert('Error', error.message);
        return;
      }

      if (device) {
        setDevices((prevDevices) => {
          // Only add device if it's not already in the list
          if (!prevDevices.find((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // Stop scan after 10 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const connectToDevice = async (device) => {
    try {
      await manager.connectToDevice(device.id);
      Alert.alert('Success', 'Connected to device!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity 
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
    >
      <Text style={styles.deviceName}>
        {item.name || 'Unknown Device'}
      </Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Access</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.scanButton, scanning && styles.scanningButton]}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.scanButtonText}>
          {scanning ? 'Scanning...' : 'Scan for Devices'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.deviceList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {scanning ? 'Searching for devices...' : 'No devices found'}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#F5A623',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#F5A623',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanningButton: {
    backgroundColor: '#ccc',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceList: {
    flex: 1,
    padding: 20,
  },
  deviceItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default ManageAccessScreen; 