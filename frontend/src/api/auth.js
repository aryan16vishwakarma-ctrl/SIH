import client from './client';

export const registerFarmer = async (farmerData) => {
  const response = await client.post('/api/auth/register/farmer', farmerData);
  return response.data;
};

export const registerBuyer = async (buyerData) => {
  const response = await client.post('/api/auth/register/buyer', buyerData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await client.post('/api/auth/login', credentials);
  return response.data;
};
