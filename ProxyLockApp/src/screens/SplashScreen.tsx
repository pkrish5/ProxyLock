import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({navigation}: any) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
    ]).start(() => {
      navigation.replace('Login');
    });
  }, []);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF5E9']}
      style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}>
        <Text style={styles.logo}>ProxyLock</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D4AF37',
    fontFamily: 'System',
  },
});

export default SplashScreen; 