import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sprout, CheckCircle2, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MagneticButton from '../components/MagneticButton';
import PriceComparisonBadge from '../components/PriceComparisonBadge';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { createProduct } from '../api/products';
import { suggestFairPriceInstant, getPricingStreamUrl } from '../api/pricing';
import { Container, Section, Card, Badge } from '../styles/primitives';

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;

  label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }

  input, select, textarea {
    padding: 0.75rem 1rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgCard};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMain};
    outline: none;
    transition: border-color 0.15s;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const RefiningIndicator = styled(motion.div)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    crop_name: 'Tomato',
    category: 'vegetables',
    quantity_kg: 1000,
    price_per_kg: '',
    harvest_date: new Date().toISOString().split('T')[0],
    description: '',
    district: 'Nashik',
  });

  const [pricing, setPricing] = useState(null);
  const [refiningText, setRefiningText] = useState('');
  const [acceptedPrice, setAcceptedPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fetch AI price suggestion whenever crop_name, quantity_kg, or district changes
  useEffect(() => {
    if (formData.crop_name && formData.quantity_kg && formData.district) {
      fetchPriceSuggestion();
    }
  }, [formData.crop_name, formData.quantity_kg, formData.district]);

  const fetchPriceSuggestion = async () => {
    try {
      // 1. Instant sub-150ms response
      const instantRes = await suggestFairPriceInstant({
        crop_name: formData.crop_name,
        quantity_kg: parseFloat(formData.quantity_kg),
        district: formData.district,
      });
      setPricing(instantRes);

      if (!formData.price_per_kg) {
        setFormData((prev) => ({
          ...prev,
          price_per_kg: instantRes.fair_farmer_price || instantRes.fair_price_max,
        }));
      }

      // 2. Open parallel SSE stream to refine pricing
      setRefiningText('AI refining estimate...');
      const streamUrl = getPricingStreamUrl(formData.crop_name, formData.quantity_kg, formData.district);
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.text) {
            setRefiningText(`AI refining estimate: ${data.text.slice(0, 35)}...`);
          }
        } catch {
          // ignore
        }
      };

      eventSource.addEventListener('result', (e) => {
        try {
          const refinedData = JSON.parse(e.data);
          setPricing({ ...refinedData, source: 'AI-refined' });
          setRefiningText('');
        } catch {
          // ignore
        }
        eventSource.close();
      });

      eventSource.onerror = () => {
        setRefiningText('');
        eventSource.close();
      };
    } catch {
      setRefiningText('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAcceptPrice = (priceVal) => {
    setFormData((prev) => ({ ...prev, price_per_kg: priceVal }));
    setAcceptedPrice(true);
    setTimeout(() => setAcceptedPrice(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.price_per_kg || parseFloat(formData.price_per_kg) <= 0) {
      setErrorMsg('Please specify a valid price per kg');
      return;
    }

    setSubmitting(true);
    try {
      await createProduct({
        crop_name: formData.crop_name,
        category: formData.category,
        quantity_kg: parseFloat(formData.quantity_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
        harvest_date: formData.harvest_date,
        description: formData.description,
      });
      navigate('/farmer/dashboard');
    } catch {
      setErrorMsg('Failed to list product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Container>
        <Section>
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

          <div style={{ marginBottom: '2rem' }}>
            <Badge>New Harvest Offer</Badge>
            <h1 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>List Your Crop For Direct Sale</h1>
          </div>

          <FormGrid onSubmit={handleSubmit}>
            <Card>
              <FormRow>
                <FormGroup>
                  <label>Crop Name</label>
                  <input
                    type="text"
                    name="crop_name"
                    value={formData.crop_name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="vegetables">Vegetables</option>
                    <option value="grains">Grains</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                    <option value="pulses">Pulses</option>
                  </select>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <label>Quantity (kg)</label>
                  <input
                    type="number"
                    name="quantity_kg"
                    value={formData.quantity_kg}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <label>Your Price / kg (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_kg"
                    value={formData.price_per_kg}
                    onChange={handleInputChange}
                    placeholder="Auto-suggested by AI"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Harvest Date</label>
                  <input
                    type="date"
                    name="harvest_date"
                    value={formData.harvest_date}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Description (Optional)</label>
                <textarea
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Organic, naturally grown, fresh harvest details..."
                />
              </FormGroup>

              <MagneticButton type="submit" disabled={submitting} size="lg" style={{ width: '100%', marginTop: '1rem' }}>
                <Sprout size={18} />
                <span>{submitting ? 'Listing Crop...' : 'Publish Listing'}</span>
              </MagneticButton>
            </Card>

            <div>
              <PriceComparisonBadge
                pricing={pricing}
                onAccept={handleAcceptPrice}
                accepted={acceptedPrice}
              />
              {refiningText && (
                <RefiningIndicator animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <span>✨ {refiningText}</span>
                </RefiningIndicator>
              )}
            </div>
          </FormGrid>
        </Section>
      </Container>
    </PageTransition>
  );
};

export default AddProduct;
