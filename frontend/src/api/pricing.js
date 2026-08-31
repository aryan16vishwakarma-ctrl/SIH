import client from './client';

export const suggestFairPriceInstant = async (pricingData) => {
  const response = await client.post('/api/pricing/suggest', pricingData);
  return response.data;
};

export const getPricingStreamUrl = (cropName, quantityKg, district) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/api/pricing/suggest/stream?crop_name=${encodeURIComponent(cropName)}&quantity_kg=${quantityKg}&district=${encodeURIComponent(district)}`;
};
