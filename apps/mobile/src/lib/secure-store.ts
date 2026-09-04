import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('funspot_access_token', token);
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync('funspot_access_token');
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('funspot_access_token');
  },
};
