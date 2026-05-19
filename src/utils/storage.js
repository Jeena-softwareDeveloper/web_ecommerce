const STORAGE_KEYS = {
  TOKEN: 'jeenora_token',
  REFRESH_TOKEN: 'jeenora_refresh_token',
  USER_INFO: 'jeenora_user_info',
  DEVICE_ID: 'jeenora_device_id',
};

export const storage = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  setToken: (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  removeToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),

  getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token) => localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),

  getUserInfo: () => {
    const info = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return info ? JSON.parse(info) : null;
  },
  setUserInfo: (info) => localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info)),
  removeUserInfo: () => localStorage.removeItem(STORAGE_KEYS.USER_INFO),

  getDeviceId: () => {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = 'web_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },
};
