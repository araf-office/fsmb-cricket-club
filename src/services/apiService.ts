// src/services/apiService.ts
import axios from 'axios';

const API_URL = 'https://script.google.com/macros/s/AKfycbzwWGaMXQI3puUqbc60_i0qjWO97mRNwwmSwaejXucWMgAH9LLBj9DT8LLJGNuZdKw/exec';

export const fetchData = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};