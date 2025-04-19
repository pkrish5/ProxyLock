# ESP32 Bluetooth Receiver for Proxy Lock App

This guide explains how to set up your ESP32 to receive the specific Bluetooth signals sent from the Proxy Lock App.

## Hardware Requirements

- ESP32 microcontroller board (ESP32-WROOM, ESP32-WROVER, or similar)
- Any electronic locking mechanism you want to control
- Power supply for the ESP32 and lock mechanism
- Wires, breadboard, etc.

## Software Requirements

- Arduino IDE
- ESP32 Arduino Core installed in Arduino IDE
- Arduino BLE libraries for ESP32

## ESP32 Code Example

Here's a basic example of ESP32 code that listens for BLE advertisements from the Proxy Lock App:

```cpp
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

// The specific UUID and identifiers to look for
#define TARGET_UUID "11111111-2222-3333-4444-555555555555"
#define TARGET_MAJOR 1001
#define TARGET_MINOR 2002

// The pin connected to your lock mechanism
#define LOCK_PIN 2

// Scanning parameters
int scanTime = 5; // seconds
BLEScan* pBLEScan;
bool lockActivated = false;
unsigned long lastActivationTime = 0;
const unsigned long AUTO_LOCK_DELAY = 10000; // Auto-lock after 10 seconds

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
      // Check if the device is advertising
      if (advertisedDevice.haveManufacturerData()) {
        std::string manufData = advertisedDevice.getManufacturerData();
        
        // Check if data matches our expected format for iBeacon
        if (manufData.length() >= 25) { // At least 25 bytes for a valid iBeacon advertisement
          // Extract UUID bytes (bytes 4-19 in the manufacturer data)
          char uuidBytes[16];
          memcpy(uuidBytes, &manufData[4], 16);
          
          // Extract major value (bytes 20-21)
          uint16_t major = (uint8_t)manufData[20] << 8 | (uint8_t)manufData[21];
          
          // Extract minor value (bytes 22-23)
          uint16_t minor = (uint8_t)manufData[22] << 8 | (uint8_t)manufData[23];
          
          // Convert UUID bytes to string for comparison
          char uuidStr[37]; // 36 chars + null terminator
          sprintf(uuidStr, "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
                  uuidBytes[0], uuidBytes[1], uuidBytes[2], uuidBytes[3],
                  uuidBytes[4], uuidBytes[5], uuidBytes[6], uuidBytes[7],
                  uuidBytes[8], uuidBytes[9], uuidBytes[10], uuidBytes[11],
                  uuidBytes[12], uuidBytes[13], uuidBytes[14], uuidBytes[15]);
          
          // Convert the UUID string to lowercase for comparison
          for(int i = 0; i < 36; i++) {
            uuidStr[i] = tolower(uuidStr[i]);
          }
          
          // Compare with our target values
          String receivedUUID = String(uuidStr);
          String targetUUID = String(TARGET_UUID);
          targetUUID.toLowerCase();
          
          if (receivedUUID.equals(targetUUID) && 
              major == TARGET_MAJOR && 
              minor == TARGET_MINOR) {
            
            Serial.println("Matching device found!");
            Serial.print("UUID: ");
            Serial.println(receivedUUID);
            Serial.print("Major: ");
            Serial.println(major);
            Serial.print("Minor: ");
            Serial.println(minor);
            
            // Activate the lock
            digitalWrite(LOCK_PIN, HIGH);
            lockActivated = true;
            lastActivationTime = millis();
            Serial.println("Lock activated!");
          }
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting ESP32 BLE Receiver...");
  
  // Initialize the lock pin
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, LOW); // Start with the lock deactivated
  
  // Initialize BLE
  BLEDevice::init("ESP32_ProxyLock");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);
  
  Serial.println("Setup complete. Scanning for BLE devices...");
}

void loop() {
  // Start scan
  BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
  Serial.print("Devices found: ");
  Serial.println(foundDevices.getCount());
  Serial.println("Scan done!");
  
  // Clear scan results
  pBLEScan->clearResults();
  
  // Check if we should auto-lock
  if (lockActivated && (millis() - lastActivationTime > AUTO_LOCK_DELAY)) {
    digitalWrite(LOCK_PIN, LOW);
    lockActivated = false;
    Serial.println("Auto-locking activated");
  }
  
  // Wait a bit before scanning again
  delay(1000);
}
```

## Wiring Instructions

1. Connect the LOCK_PIN (default is GPIO2) of your ESP32 to your lock mechanism through an appropriate relay or driver circuit.
2. Power your ESP32 via USB or external power supply.

## Customizing for Your Lock

Depending on your specific lock mechanism, you might need to:

1. Change the LOCK_PIN to a different GPIO pin on the ESP32
2. Invert the logic (HIGH/LOW) for activating/deactivating the lock
3. Adjust the AUTO_LOCK_DELAY timing to keep the lock open for a longer or shorter period

## Troubleshooting

- Make sure the UUID, major, and minor values match exactly between the app and ESP32 code
- Check the serial monitor (115200 baud) for debugging information
- Ensure your ESP32 has power and is within Bluetooth range of your mobile device
- If the ESP32 doesn't detect the broadcast, try changing the scanTime value

## Advanced Features

You could extend this basic implementation to include:
- Multiple authorized UUIDs for different users
- A log of entry/exit events stored on an SD card
- WiFi connectivity for remote monitoring
- Additional security measures like encryption or rolling codes 