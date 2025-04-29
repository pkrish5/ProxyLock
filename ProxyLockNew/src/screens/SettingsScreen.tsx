import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [homeLocation, setHomeLocation] = useState(null);

  useEffect(() => {
    loadHomeLocation();
  }, []);

  const loadHomeLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('homeLocation');
      if (savedLocation) {
        setHomeLocation(JSON.parse(savedLocation));
      }
    } catch (error) {
      console.error('Failed to load home location:', error);
    }
  };

  const setCurrentLocationAsHome = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        try {
          await AsyncStorage.setItem('homeLocation', JSON.stringify(location));
          setHomeLocation(location);
          Alert.alert('Success', 'Home location has been set!');
        } catch (error) {
          Alert.alert('Error', 'Failed to save home location');
        }
      },
      (error) => {
        Alert.alert('Error', 'Failed to get current location');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Location</Text>
          <View style={styles.locationInfo}>
            {homeLocation ? (
              <>
                <Text style={styles.locationText}>
                  Latitude: {homeLocation.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  Longitude: {homeLocation.longitude.toFixed(6)}
                </Text>
              </>
            ) : (
              <Text style={styles.locationText}>No home location set</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={setCurrentLocationAsHome}
          >
            <Text style={styles.buttonText}>Set Current Location as Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proximity Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-unlock Distance</Text>
            <Text style={styles.settingValue}>100 meters</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bluetooth Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Advertising Interval</Text>
            <Text style={styles.settingValue}>1 second</Text>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  locationInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#F5A623',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen; 