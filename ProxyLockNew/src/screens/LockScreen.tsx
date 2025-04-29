import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';
import Geolocation from '@react-native-community/geolocation';
import { SettingsService } from '../services/SettingsService';

const manager = new BleManager();
const settingsService = new SettingsService();

// These will be the service and characteristic UUIDs your ESP32 will look for
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

// Simple signals that ESP32 can easily interpret
const UNLOCK_SIGNAL = new Uint8Array([0x55, 0x4E]); // "UN" in hex
const LOCK_SIGNAL = new Uint8Array([0x4C, 0x4B]);   // "LK" in hex

const LockScreen = ({ navigation }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [batteryLevel] = useState(80);
  const [lastOpenedLogs] = useState([
    { name: 'Roommate 1', time: '8:09 AM Today' },
    { name: 'Roommate 2', time: '2:48 AM Today' },
    { name: 'Roommate 3', time: '10:00 PM 4/01' },
  ]);
  const [isNearHome, setIsNearHome] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);

  useEffect(() => {
    setupBleAdvertising();
    startLocationTracking();

    return () => {
      stopAdvertising();
      manager.destroy();
    };
  }, []);

  useEffect(() => {
    // When nearHome status changes, update advertising
    if (isNearHome !== isAdvertising) {
      if (isNearHome) {
        startAdvertising(UNLOCK_SIGNAL);
      } else {
        startAdvertising(LOCK_SIGNAL);
      }
    }
  }, [isNearHome]);

  const setupBleAdvertising = async () => {
    if (Platform.OS === 'ios') {
      manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          checkPermissionsAndStartAdvertising();
        }
      }, true);
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      if (Object.values(granted).every(permission => permission === PermissionsAndroid.RESULTS.GRANTED)) {
        checkPermissionsAndStartAdvertising();
      }
    }
  };

  const checkPermissionsAndStartAdvertising = async () => {
    try {
      // Start with lock signal until we determine location
      await startAdvertising(LOCK_SIGNAL);
    } catch (error) {
      console.error('Failed to start advertising:', error);
      Alert.alert('Bluetooth Error', 'Failed to start Bluetooth advertising. Please check your Bluetooth settings.');
    }
  };

  const startAdvertising = async (signal: Uint8Array) => {
    try {
      // Stop any existing advertising
      await stopAdvertising();

      // Create a peripheral manager
      await manager.createPeripheral({
        id: 'proxylock',
        name: 'ProxyLock',
        services: [{
          uuid: SERVICE_UUID,
          characteristics: [{
            uuid: CHARACTERISTIC_UUID,
            value: Array.from(signal).map(byte => byte.toString(16).padStart(2, '0')).join(''),
            properties: {
              read: true,
              write: false,
              notify: false,
              indicate: false,
            },
            permissions: {
              read: true,
              write: false,
            },
          }],
        }],
      });

      setIsAdvertising(true);
      console.log('Started advertising signal:', Array.from(signal));
    } catch (error) {
      console.error('Error in startAdvertising:', error);
      setIsAdvertising(false);
    }
  };

  const stopAdvertising = async () => {
    try {
      await manager.stopAdvertising();
      setIsAdvertising(false);
    } catch (error) {
      console.error('Error stopping advertising:', error);
    }
  };

  const startLocationTracking = () => {
    Geolocation.watchPosition(
      (position) => {
        checkIfNearHome(position.coords);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Failed to get your location. Please check your location settings.');
      },
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 3000,
      }
    );
  };

  const checkIfNearHome = async (currentCoords) => {
    try {
      const isWithinRadius = await settingsService.isWithinHomeRadius({
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
      });

      if (isWithinRadius !== isNearHome) {
        setIsNearHome(isWithinRadius);
        // The useEffect will handle starting/stopping advertising
      }
    } catch (error) {
      console.error('Error checking home radius:', error);
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.apartmentText}>APARTMENT</Text>
          <Text style={styles.titleText}>Front Door</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={navigateToSettings}>
            <Text style={styles.icon}>⚙️</Text>
          </TouchableOpacity>
          <Text style={styles.icon}>👤</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.lockContainer}
        onPress={toggleLock}
      >
        <View style={styles.lockCircle}>
          <Text style={styles.lockIcon}>{isLocked ? '🔒' : '🔓'}</Text>
        </View>
        <Text style={styles.statusText}>Status: {isLocked ? 'Locked' : 'Unlocked'}</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.batteryCard}>
          <Text style={styles.cardTitle}>BATTERY:</Text>
          <View style={styles.batteryIndicator}>
            {[...Array(10)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.batteryBar,
                  { backgroundColor: i < 8 ? '#90EE90' : '#ddd' },
                ]}
              />
            ))}
          </View>
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
          <Text style={styles.batterySubtext}>5 Days, 6 Hours</Text>
        </View>

        <TouchableOpacity 
          style={styles.manageCard}
          onPress={() => navigation.navigate('ManageAccess')}
        >
          <Text style={styles.cardTitle}>Manage Access</Text>
          <View style={styles.avatarContainer}>
            {[1, 2, 3].map((num) => (
              <View key={num} style={styles.avatar} />
            ))}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>LAST OPENED:</Text>
          <TouchableOpacity>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
        {lastOpenedLogs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <View style={styles.logAvatar} />
            <View style={styles.logInfo}>
              <Text style={styles.logName}>{log.name}</Text>
              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.disableButton, isLocked && styles.enableButton]}
        onPress={toggleLock}
      >
        <Text style={styles.disableButtonText}>
          {isLocked ? 'Enable Lock' : 'Disable Lock'}
        </Text>
      </TouchableOpacity>
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
  headerCenter: {
    alignItems: 'center',
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  icon: {
    fontSize: 24,
  },
  apartmentText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lockContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  lockCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockIcon: {
    fontSize: 50,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
  batteryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  batteryIndicator: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 5,
  },
  batteryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#90EE90',
    borderRadius: 4,
  },
  batteryText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  batterySubtext: {
    fontSize: 12,
    color: '#666',
  },
  avatarContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
  },
  logsContainer: {
    flex: 1,
    padding: 20,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  logsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshIcon: {
    fontSize: 20,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: '500',
  },
  logTime: {
    fontSize: 14,
    color: '#666',
  },
  disableButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  disableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LockScreen; 