import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileService } from '../services/FileService';

const TestScreen: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testFileOperations = async () => {
    try {
      // Test writing
      await FileService.writeIpToFile('192.168.1.1');
      setResult('Write successful\n');

      // Test reading
      const ip = await FileService.readIpFromFile();
      setResult(prev => prev + `Read successful: ${ip}\n`);

      // Test deleting
      await FileService.deleteIpFile();
      setResult(prev => prev + 'Delete successful\n');

      // Verify deletion
      const ipAfterDelete = await FileService.readIpFromFile();
      setResult(prev => prev + `File after delete: ${ipAfterDelete}\n`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={testFileOperations}>
        <Text style={styles.buttonText}>Test File Operations</Text>
      </TouchableOpacity>
      <Text style={styles.result}>{result}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TestScreen; 