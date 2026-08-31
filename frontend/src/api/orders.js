import client from './client';

export const createOrder = async (orderData) => {
  const response = await client.post('/api/orders', orderData);
  return response.data;
};

export const getFarmerOrders = async (farmerId) => {
  const response = await client.get(`/api/orders/farmer/${farmerId}`);
  return response.data;
};

export const getBuyerOrders = async (buyerId) => {
  const response = await client.get(`/api/orders/buyer/${buyerId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await client.patch(`/api/orders/${orderId}/status`, { status });
  return response.data;
};
