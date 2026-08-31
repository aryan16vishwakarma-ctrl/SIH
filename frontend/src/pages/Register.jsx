import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, Lock, User, MapPin, Sprout, Store, Navigation, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MagneticButton from '../components/MagneticButton';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Container, Card } from '../styles/primitives';

const RegisterCard = styled(Card)`
  max-width: 580px;
  margin: 3rem auto;
  padding: 2.5rem;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const RoleTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.25rem;
  background: ${({ theme }) => theme.colors.bgMain};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 1.5rem;
`;

const RoleTab = styled.button`
  padding: 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;

  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#555555')};
  transition: all 0.15s;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;

  label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }

  input, select {
    padding: 0.75rem 1rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgMain};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMain};
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const LocationBox = styled.div`
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => `${theme.colors.accent}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.accent}30`};
  margin: 1rem 0;

  .loc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
`;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registerFarmer, registerBuyer, login } = useAuth();

  const [role, setRole] = useState(searchParams.get('role') || 'farmer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    village: 'Pimplegaon',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.17,
    longitude: 73.98,
    fpo_name: 'Sahyadri Farmers Co',
    buyer_type: 'consumer',
  });

  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'farmer' || roleParam === 'buyer')) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(position.coords.latitude.toFixed(4)),
          longitude: parseFloat(position.coords.longitude.toFixed(4)),
        }));
        setLocating(false);
      },
      () => {
        setErrorMsg('Unable to retrieve location');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (role === 'farmer') {
        await registerFarmer({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          village: formData.village,
          district: formData.district,
          state: formData.state,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          fpo_name: formData.fpo_name,
        });
      } else {
        await registerBuyer({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          buyer_type: formData.buyer_type,
        });
      }

      setSuccess(true);
      await login({ phone: formData.phone, password: formData.password, role });

      setTimeout(() => {
        if (role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/marketplace');
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Registration failed. Check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Container>
        <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

        <RegisterCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
            <p style={{ fontSize: '0.85rem', color: '#555555' }}>
              Join KisaanConnect direct agricultural network
            </p>
          </div>

          <RoleTabs>
            <RoleTab $active={role === 'farmer'} onClick={() => setRole('farmer')} type="button">
              <Sprout size={16} />
              <span>Farmer</span>
            </RoleTab>

            <RoleTab $active={role === 'buyer'} onClick={() => setRole('buyer')} type="button">
              <Store size={16} />
              <span>Buyer</span>
            </RoleTab>
          </RoleTabs>

          <form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit phone"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Choose password"
                required
              />
            </FormGroup>

            {role === 'farmer' && (
              <>
                <FormRow>
                  <FormGroup>
                    <label>Village</label>
                    <input type="text" name="village" value={formData.village} onChange={handleInputChange} />
                  </FormGroup>

                  <FormGroup>
                    <label>District</label>
                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} />
                  </FormGroup>
                </FormRow>

                <LocationBox>
                  <div className="loc-head">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1B4332', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} /> Farm Location Coordinates
                    </span>
                    <MagneticButton type="button" onClick={handleGetLocation} size="sm">
                      <Navigation size={12} />
                      <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
                    </MagneticButton>
                  </div>

                  <FormRow>
                    <FormGroup>
                      <label>Latitude</label>
                      <input type="number" step="0.0001" name="latitude" value={formData.latitude} onChange={handleInputChange} />
                    </FormGroup>
                    <FormGroup>
                      <label>Longitude</label>
                      <input type="number" step="0.0001" name="longitude" value={formData.longitude} onChange={handleInputChange} />
                    </FormGroup>
                  </FormRow>
                </LocationBox>
              </>
            )}

            {role === 'buyer' && (
              <FormGroup>
                <label>Buyer Type</label>
                <select name="buyer_type" value={formData.buyer_type} onChange={handleInputChange}>
                  <option value="consumer">Direct Retail Consumer</option>
                  <option value="bulk_buyer">Bulk Procurement / Wholesaler</option>
                  <option value="restaurant">Hotel / Restaurant</option>
                </select>
              </FormGroup>
            )}

            <MagneticButton type="submit" disabled={loading} size="lg" style={{ width: '100%', marginTop: '1rem' }}>
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Registration Complete! Redirecting...</span>
                </>
              ) : (
                <span>{loading ? 'Creating Account...' : 'Register'}</span>
              )}
            </MagneticButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#555555' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#1B4332', fontWeight: 700 }}>
              Login Here
            </Link>
          </div>
        </RegisterCard>
      </Container>
    </PageTransition>
  );
};

export default Register;
