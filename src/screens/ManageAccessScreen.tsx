import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const ManageAccessScreen = ({ navigation }) => {
  const [users] = useState([
    { id: 1, name: 'You', isAdmin: true },
    { id: 2, name: 'Roommate 1', isAdmin: false },
    { id: 3, name: 'Roommate 2', isAdmin: false },
    { id: 4, name: 'Roommate 3', isAdmin: false },
  ]);

  const handleRemoveAccess = (user) => {
    Alert.alert(
      'Remove Access',
      `${user.name} will be remove from group APARTMENT`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove access',
          onPress: () => {/* Handle remove access */},
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Front Door</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Manage Access</Text>
        <TouchableOpacity>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>(1) Admin</Text>

      {users.map(user => (
        <View key={user.id} style={styles.userRow}>
          <View style={styles.userInfo}>
            <View style={styles.avatar} />
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          {!user.isAdmin && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveAccess(user)}
            >
              <Text style={styles.removeButtonText}>−</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#000',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    fontSize: 32,
    color: '#F5A623',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#F5A623',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ManageAccessScreen; 