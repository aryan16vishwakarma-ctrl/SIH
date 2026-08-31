import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, Power, Sprout } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MagneticButton from '../components/MagneticButton';
import AnimatedCounter from '../components/AnimatedCounter';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { getProducts, updateProduct } from '../api/products';
import { Container, Section, Card, Grid, Badge } from '../styles/primitives';

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1.25rem;

  .stat-icon {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme, $accent }) => ($accent ? `${theme.colors.secondary}20` : `${theme.colors.accent}20`)};
    color: ${({ theme, $accent }) => ($accent ? theme.colors.secondary : theme.colors.accent)};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-val {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.75rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primary};
  }

  .stat-label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const ListingCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
`;

const SwitchButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  cursor: pointer;

  background: ${({ $active, theme }) => ($active ? `${theme.colors.accent}20` : `${theme.colors.error}20`)};
  color: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.error)};
  border: 1px solid ${({ $active, theme }) => ($active ? `${theme.colors.accent}40` : `${theme.colors.error}40`)};
`;

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchFarmerProducts();
  }, [user]);

  const fetchFarmerProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getProducts();
      const myProducts = allProducts.filter(
        (p) => p.farmer_id === user?.id || p.farmer?.id === user?.id
      );
      setProducts(myProducts);
    } catch {
      setErrorMsg('Failed to load farmer listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const updated = await updateProduct(productId, { is_active: !currentStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: updated.is_active } : p))
      );
    } catch {
      setErrorMsg('Failed to update product status');
    }
  };

  const totalListings = products.length;
  const activeListings = products.filter((p) => p.is_active).length;
  const estValuation = products.reduce((acc, p) => acc + p.quantity_kg * p.price_per_kg, 0);

  return (
    <PageTransition>
      <Container>
        <Section>
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

          <DashboardHeader>
            <div>
              <Badge>Farmer Portal</Badge>
              <h1 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>
                Welcome, {user?.name || 'Farmer'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#555555', marginTop: '0.25rem' }}>
                Manage your active crop listings and AI pricing details
              </p>
            </div>

            <Link to="/farmer/add-product">
              <MagneticButton size="lg">
                <Plus size={18} />
                <span>+ Add Product</span>
              </MagneticButton>
            </Link>
          </DashboardHeader>

          <StatsGrid>
            <StatCard>
              <div className="stat-icon">
                <Package size={24} />
              </div>
              <div>
                <div className="stat-val">
                  <AnimatedCounter value={totalListings} />
                </div>
                <div className="stat-label">Total Crop Listings</div>
              </div>
            </StatCard>

            <StatCard>
              <div className="stat-icon">
                <Sprout size={24} />
              </div>
              <div>
                <div className="stat-val">
                  <AnimatedCounter value={activeListings} />
                </div>
                <div className="stat-label">Active Mandi Offers</div>
              </div>
            </StatCard>

            <StatCard $accent>
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="stat-val">
                  ₹<AnimatedCounter value={Math.round(estValuation)} />
                </div>
                <div className="stat-label">Est. Inventory Valuation</div>
              </div>
            </StatCard>
          </StatsGrid>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Your Crop Listings</h2>

          {loading ? (
            <LoadingSpinner message="Loading your listings..." />
          ) : products.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem' }}>
              <Sprout size={48} style={{ color: '#40916C', marginBottom: '1rem' }} />
              <h3>No Listings Yet</h3>
              <p style={{ color: '#555555', margin: '0.5rem 0 1.5rem 0' }}>
                Add your first harvest to connect with direct buyers.
              </p>
              <Link to="/farmer/add-product">
                <MagneticButton>+ Add Crop Listing</MagneticButton>
              </Link>
            </Card>
          ) : (
            <Grid $cols={3}>
              {products.map((p) => (
                <ListingCard key={p.id}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge>{p.category}</Badge>
                      <SwitchButton
                        onClick={() => handleToggleActive(p.id, p.is_active)}
                        $active={p.is_active}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Power size={14} />
                        <span>{p.is_active ? 'Active' : 'Inactive'}</span>
                      </SwitchButton>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', margin: '0.75rem 0 0.25rem 0' }}>{p.crop_name}</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#40916C' }}>
                      ₹{p.price_per_kg} <span style={{ fontSize: '0.85rem', color: '#555555' }}>/ kg</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#555555', marginTop: '0.5rem' }}>
                      Quantity: <strong>{p.quantity_kg} kg</strong>
                    </p>
                  </div>
                </ListingCard>
              ))}
            </Grid>
          )}
        </Section>
      </Container>
    </PageTransition>
  );
};

export default FarmerDashboard;
