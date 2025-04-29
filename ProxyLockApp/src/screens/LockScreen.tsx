import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BleManager} from 'react-native-ble-plx';

// Sample avatar placeholder (in a real app, use actual images)
const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/40';

interface RoommateEntry {
  id: string;
  name: string;
  time: string;
  avatar: string;
}

const LockScreen = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [lastOpened, setLastOpened] = useState('2:30 PM');
  const [bleManager, setBleManager] = useState<BleManager | null>(null);
  const navigation = useNavigation();
  
  // Sample roommate data
  const roommates: RoommateEntry[] = [
    {
      id: '1',
      name: 'John',
      time: '2:30 PM',
      avatar: AVATAR_PLACEHOLDER,
    },
    {
      id: '2',
      name: 'Sarah',
      time: '10:15 AM',
      avatar: AVATAR_PLACEHOLDER,
    },
    {
      id: '3',
      name: 'Mike',
      time: 'Yesterday',
      avatar: AVATAR_PLACEHOLDER,
    },
  ];

  useEffect(() => {
    // Initialize BLE manager
    const manager = new BleManager();
    setBleManager(manager);

    return () => {
      // Clean up BLE manager
      manager.destroy();
    };
  }, []);

  const toggleLock = async () => {
    try {
      // In a real app, this would send a BLE command to the lock
      // For demo purposes, we just toggle the state
      setIsLocked(!isLocked);
      
      // Update the last opened time if unlocking
      if (isLocked) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        setLastOpened(`${formattedHours}:${formattedMinutes} ${ampm}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to communicate with the lock');
    }
  };

  const logout = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>APARTMENT</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={logout}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>P</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.lockTitle}>Front Door</Text>
        
        {/* Lock button */}
        <TouchableOpacity 
          style={[styles.lockButton, isLocked ? styles.lockedButton : styles.unlockedButton]} 
          onPress={toggleLock}
        >
          <Text style={styles.lockButtonIcon}>{isLocked ? '🔒' : '🔓'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.lockStatus}>
          {isLocked ? 'Your door is locked' : 'Your door is unlocked'}
        </Text>
        
        {/* Lock info */}
        <View style={styles.infoContainer}>
          <View style={styles.batteryContainer}>
            <Text style={styles.batteryIcon}>🔋</Text>
            <Text style={styles.batteryText}>{batteryLevel}%</Text>
          </View>
          
          <View style={styles.accessContainer}>
            <TouchableOpacity style={styles.manageAccessButton}>
              <Text style={styles.manageAccessText}>Manage Access</Text>
            </TouchableOpacity>
            <View style={styles.avatarRow}>
              {roommates.map((roommate, index) => (
                <View 
                  key={roommate.id} 
                  style={[
                    styles.avatarContainer, 
                    { marginLeft: index > 0 ? -15 : 0 }
                  ]}
                >
                  <Image 
                    source={{ uri: roommate.avatar }} 
                    style={styles.avatar} 
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* History card */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Last Opened</Text>
          
          {roommates.map((roommate) => (
            <View key={roommate.id} style={styles.historyEntry}>
              <Image 
                source={{ uri: roommate.avatar }} 
                style={styles.historyAvatar} 
              />
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{roommate.name}</Text>
                <Text style={styles.historyTime}>{roommate.time}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Disable lock button */}
        <TouchableOpacity style={styles.disableButton}>
          <Text style={styles.disableButtonText}>Disable Lock</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#006AFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  lockButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  lockedButton: {
    backgroundColor: '#006AFE',
  },
  unlockedButton: {
    backgroundColor: '#4CAF50',
  },
  lockButtonIcon: {
    fontSize: 50,
  },
  lockStatus: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 32,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  batteryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  batteryText: {
    fontSize: 16,
    color: '#333333',
  },
  accessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  manageAccessButton: {
    marginRight: 8,
  },
  manageAccessText: {
    fontSize: 14,
    color: '#006AFE',
    fontWeight: '500',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  historyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  historyTime: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  disableButton: {
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  disableButtonText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '500',
  },
});

export default LockScreen; 