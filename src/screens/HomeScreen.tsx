import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [isLocked, setIsLocked] = React.useState(false);
  const batteryLevel = 80;
  const batteryDays = 5;
  const batteryHours = 6;

  const lastOpened = [
    { id: 1, name: 'Roommate 1', time: '8:09 AM Today' },
    { id: 2, name: 'Roommate 2', time: '2:48 AM Today' },
    { id: 3, name: 'Roommate 3', time: '10:00 PM 4/01' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>APARTMENT</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>Front Door</Text>

      <View style={styles.lockContainer}>
        <View style={[styles.lockCircle, isLocked ? styles.lockedCircle : styles.unlockedCircle]}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
        <Text style={styles.lockStatus}>Status: {isLocked ? 'Locked' : 'Unlocked'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.batteryCard}>
          <Text style={styles.cardTitle}>BATTERY:</Text>
          <View style={styles.batteryBar}>
            {[...Array(10)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.batterySegment,
                  { backgroundColor: i < 8 ? '#4CAF50' : '#ddd' },
                ]}
              />
            ))}
          </View>
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
          <Text style={styles.batterySubtext}>{batteryDays} Days, {batteryHours} Hours</Text>
        </View>

        <TouchableOpacity 
          style={styles.manageCard}
          onPress={() => navigation.navigate('ManageAccess')}
        >
          <Text style={styles.cardTitle}>Manage Access</Text>
          <View style={styles.avatarGroup}>
            {lastOpened.map((user, index) => (
              <View
                key={user.id}
                style={[styles.avatar, { zIndex: lastOpened.length - index }]}
              />
            ))}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>LAST OPENED:</Text>
        {lastOpened.map(user => (
          <View key={user.id} style={styles.historyItem}>
            <View style={styles.avatar} />
            <Text style={styles.historyName}>{user.name}</Text>
            <Text style={styles.historyTime}>{user.time}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.disableButton}
        onPress={() => setIsLocked(!isLocked)}
      >
        <Text style={styles.disableButtonText}>
          {isLocked ? 'Unlock Door' : 'Lock Door'}
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
  menuIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  lockContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  lockCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lockedCircle: {
    backgroundColor: '#FFE0B2',
  },
  unlockedCircle: {
    backgroundColor: '#E3F2FD',
  },
  lockIcon: {
    fontSize: 40,
  },
  lockStatus: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  batteryCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  manageCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  batteryBar: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  batterySegment: {
    flex: 1,
    height: 8,
    marginHorizontal: 1,
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
  avatarGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  historyContainer: {
    padding: 20,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  historyTime: {
    color: '#666',
  },
  disableButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 