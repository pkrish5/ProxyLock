import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export class FileService {
  private static readonly IP_FILENAME = 'ip.txt';

  /**
   * Gets the full path for the IP file
   */
  private static async getIpFilePath(): Promise<string> {
    // Log all available RNFS paths
    console.log('Available RNFS paths:', {
      MainBundlePath: RNFS.MainBundlePath,
      DocumentDirectoryPath: RNFS.DocumentDirectoryPath,
      CachesDirectoryPath: RNFS.CachesDirectoryPath,
      TemporaryDirectoryPath: RNFS.TemporaryDirectoryPath,
      LibraryDirectoryPath: RNFS.LibraryDirectoryPath,
    });
    
    // Use the documents directory for iOS
    const directory = RNFS.DocumentDirectoryPath;
    console.log('Using directory:', directory);
    
    // Ensure the directory exists
    const dirExists = await RNFS.exists(directory);
    if (!dirExists) {
      console.log('Creating directory:', directory);
      await RNFS.mkdir(directory);
    }
    
    const filePath = `${directory}/${this.IP_FILENAME}`;
    console.log('Full file path:', filePath);
    
    // Validate the path is within the documents directory
    if (!filePath.startsWith(RNFS.DocumentDirectoryPath)) {
      throw new Error('Invalid file path: Must be within documents directory');
    }
    
    return filePath;
  }

  /**
   * Writes IP address to a file in the app's documents directory
   * @param ipAddress The IP address to write
   */
  static async writeIpToFile(ipAddress: string): Promise<void> {
    try {
      const filePath = await this.getIpFilePath();
      
      // Verify directory is writable with a test file
      const testPath = `${RNFS.DocumentDirectoryPath}/test.txt`;
      
      try {
        // Write test file
        await RNFS.writeFile(testPath, 'test', 'utf8');
        const testExists = await RNFS.exists(testPath);
        console.log('Test file write successful, exists:', testExists);
        
        // Clean up test file
        if (testExists) {
          await RNFS.unlink(testPath);
        }
      } catch (testError) {
        console.error('Test file write failed:', testError);
        throw new Error(`No write permission to directory: ${testError.message}`);
      }

      // Write the actual file
      await RNFS.writeFile(filePath, ipAddress, 'utf8', { 
        encoding: 'utf8',
        NSFileProtectionKey: 'NSFileProtectionCompleteUntilFirstUserAuthentication'
      });
      console.log('Successfully wrote IP to file');
      
      // Verify the file was written
      const exists = await RNFS.exists(filePath);
      console.log('File exists after write:', exists);
      
      if (exists) {
        const content = await RNFS.readFile(filePath, 'utf8');
        console.log('File content verification:', content === ipAddress);
      }
    } catch (error) {
      console.error('Error writing IP to file:', error);
      throw error;
    }
  }

  /**
   * Reads IP address from the file in the app's documents directory
   * @returns The IP address string or null if file doesn't exist
   */
  static async readIpFromFile(): Promise<string | null> {
    try {
      const filePath = await this.getIpFilePath();
      console.log('Reading IP from path:', filePath);
      
      const exists = await RNFS.exists(filePath);
      console.log('File exists before read:', exists);
      
      if (!exists) {
        console.log('IP file does not exist');
        return null;
      }

      const ipAddress = await RNFS.readFile(filePath, 'utf8');
      console.log('Successfully read IP from file');
      return ipAddress;
    } catch (error) {
      console.error('Error reading IP from file:', error);
      throw error;
    }
  }

  /**
   * Deletes the IP file if it exists
   */
  static async deleteIpFile(): Promise<void> {
    try {
      const filePath = await this.getIpFilePath();
      console.log('Attempting to delete file at path:', filePath);
      
      const exists = await RNFS.exists(filePath);
      console.log('File exists before delete:', exists);
      
      if (exists) {
        await RNFS.unlink(filePath);
        console.log('Successfully deleted IP file');
        
        // Verify deletion
        const stillExists = await RNFS.exists(filePath);
        console.log('File exists after delete:', stillExists);
      }
    } catch (error) {
      console.error('Error deleting IP file:', error);
      throw error;
    }
  }
} 