import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Plus, Minus, ArrowLeft, CheckCircle2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageTransition from '../components/PageTransition';
import MagneticButton from '../components/MagneticButton';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../api/products';
import { createOrder } from '../api/orders';
import { Container, Section, Card, Badge } from '../styles/primitives';

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const HeroMorphBlock = styled(motion.div)`
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const QuantityBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  .qty-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgMain};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
  }

  .qty-val {
    font-size: 1.25rem;
    font-weight: 800;
    min-width: 60px;
    text-align: center;
  }
`;

const ChartCard = styled(Card)`
  margin-top: 2rem;
  padding: 2rem;
  text-align: center;
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(50);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch {
      setErrorMsg('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(product?.quantity_kg || 1000, prev + delta)));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (role !== 'buyer') {
      setErrorMsg('Only registered buyers can place orders');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderRes = await createOrder({
        product_id: product.id,
        quantity_ordered_kg: parseFloat(quantity),
      });
      setOrderSuccess(orderRes);
    } catch {
      setErrorMsg('Failed to place order. Try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <Container>
          <Section>
            <LoadingSpinner message="Loading product details..." />
          </Section>
        </Container>
      </PageTransition>
    );
  }

  if (!product) return null;

  const mandiPrice = product.mandi_reference_price || product.price_per_kg * 0.75;
  const retailPrice = product.price_per_kg * 1.35;
  const farmerEarnings = product.price_per_kg * quantity;
  const retailCost = retailPrice * quantity;

  const chartData = [
    { name: 'Traditional Mandi', price: Math.round(mandiPrice * quantity), fill: '#94a3b8' },
    { name: 'KisaanConnect Deal', price: Math.round(farmerEarnings), fill: '#40916C' },
    { name: 'Traditional Retail', price: Math.round(retailCost), fill: '#E9A23B' },
  ];

  return (
    <PageTransition>
      <Container>
        <Section>
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#1B4332', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>

          <AnimatePresence mode="wait">
            {orderSuccess ? (
              <ChartCard key="success-view">
                <CheckCircle2 size={48} style={{ color: '#40916C', marginBottom: '1rem' }} />
                <h2>Order Placed Successfully!</h2>
                <p style={{ color: '#555555', margin: '0.5rem 0 1.5rem 0' }}>
                  Delivery distance: <strong>{orderSuccess.delivery_distance_km} km</strong> (Est. {orderSuccess.estimated_delivery_days} days)
                </p>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={20} /> Savings & Revenue Breakdown
                </h3>

                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#555555" />
                      <YAxis stroke="#555555" />
                      <Tooltip />
                      <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Link to="/buyer/orders" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                  <MagneticButton size="lg">View Order History</MagneticButton>
                </Link>
              </ChartCard>
            ) : (
              <DetailGrid key="detail-view">
                <HeroMorphBlock layoutId={`product-card-${product.id}`}>
                  <Badge>{product.category}</Badge>
                  <h1 style={{ fontSize: '2.25rem', margin: '0.5rem 0 0.25rem 0' }}>{product.crop_name}</h1>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#40916C' }}>
                    ₹{product.price_per_kg} <span style={{ fontSize: '1rem', color: '#555555' }}>/ kg</span>
                  </div>

                  <p style={{ color: '#555555', margin: '1rem 0' }}>
                    {product.description || 'Direct farm harvest with zero middleman markup.'}
                  </p>

                  <QuantityBox>
                    <button className="qty-btn" onClick={() => handleQuantityChange(-10)}>
                      <Minus size={16} />
                    </button>
                    <span className="qty-val">{quantity} kg</span>
                    <button className="qty-btn" onClick={() => handleQuantityChange(10)}>
                      <Plus size={16} />
                    </button>
                  </QuantityBox>

                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1rem 0' }}>
                    Total Order Value: <span style={{ color: '#40916C' }}>₹{Math.round(product.price_per_kg * quantity)}</span>
                  </div>

                  <MagneticButton onClick={handlePlaceOrder} disabled={placingOrder} size="lg" style={{ width: '100%' }}>
                    <ShieldCheck size={18} />
                    <span>{placingOrder ? 'Placing Order...' : 'Place Direct Order'}</span>
                  </MagneticButton>
                </HeroMorphBlock>

                <Card>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Farmer Information</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <User size={32} style={{ color: '#40916C' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{product.farmer?.name || 'Local Farmer'}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#555555' }}>
                        {product.farmer?.village}, {product.farmer?.district}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#555555', lineHeight: '1.5' }}>
                    Direct connection removes 3-4 intermediaries, giving farmers up to 40% higher income while saving buyers 35% over traditional retail.
                  </p>
                </Card>
              </DetailGrid>
            )}
          </AnimatePresence>
        </Section>
      </Container>
    </PageTransition>
  );
};

export default ProductDetail;
