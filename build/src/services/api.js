import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const verifyTelegramCode = async (username, code) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, { username, code });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
  }
};

export const getUserInfo = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/user/${username}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
  }
};

export const performMining = async (username) => {
  try {
    const response = await axios.post(`${API_URL}/mine`, { username });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
  }
};
