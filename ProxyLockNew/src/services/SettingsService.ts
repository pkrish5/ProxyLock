import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

// Storage keys
const STORAGE_KEYS = {
  HOME_LOCATION: '@proxylock:home_location',
  AUTO_UNLOCK_ENABLED: '@proxylock:auto_unlock_enabled',
};

export interface LocationSettings {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export class SettingsService {
  // Home location settings
  async saveHomeLocation(location: LocationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.HOME_LOCATION,
        JSON.stringify(location)
      );
      console.log('Home location saved successfully');
    } catch (error) {
      console.error('Error saving home location:', error);
      throw error;
    }
  }

  async getHomeLocation(): Promise<LocationSettings | null> {
    try {
      const locationStr = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATION);
      if (!locationStr) return null;
      return JSON.parse(locationStr) as LocationSettings;
    } catch (error) {
      console.error('Error getting home location:', error);
      throw error;
    }
  }

  // Auto-unlock settings
  async setAutoUnlockEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTO_UNLOCK_ENABLED,
        JSON.stringify(enabled)
      );
      console.log('Auto-unlock setting saved:', enabled);
    } catch (error) {
      console.error('Error saving auto-unlock setting:', error);
      throw error;
    }
  }

  async isAutoUnlockEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_UNLOCK_ENABLED);
      return enabled ? JSON.parse(enabled) : false;
    } catch (error) {
      console.error('Error getting auto-unlock setting:', error);
      return false;
    }
  }

  // Geolocation methods
  getCurrentLocation(): Promise<Geolocation.GeoPosition> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Current location:', position);
          resolve(position);
        },
        (error) => {
          console.error('Error getting current location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  watchLocation(
    callback: (position: Geolocation.GeoPosition) => void,
    errorCallback?: (error: Geolocation.GeoError) => void
  ): number {
    return Geolocation.watchPosition(
      callback,
      errorCallback,
      {
        enableHighAccuracy: true,
        interval: 5000, // Update every 5 seconds
        fastestInterval: 3000, // Fastest possible update interval
        distanceFilter: 10, // Minimum distance (meters) before triggering update
      }
    );
  }

  clearLocationWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
    console.log('Location watch cleared:', watchId);
  }

  // Helper method to calculate distance between two points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if current location is within home radius
  async isWithinHomeRadius(currentLocation: {
    latitude: number;
    longitude: number;
  }): Promise<boolean> {
    const homeLocation = await this.getHomeLocation();
    if (!homeLocation) return false;

    const distance = this.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      homeLocation.latitude,
      homeLocation.longitude
    );

    return distance <= homeLocation.radius;
  }
} 