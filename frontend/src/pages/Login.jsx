import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Sprout, Store, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MagneticButton from '../components/MagneticButton';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Container, Card } from '../styles/primitives';

const AuthCard = styled(Card)`
  max-width: 440px;
  margin: 4rem auto;
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;

  label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }

  .input-wrap {
    position: relative;

    input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
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

    svg {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: ${({ theme }) => theme.colors.textDim};
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('farmer');
  const [phone, setPhone] = useState('9823011111');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login({ phone, password, role });
      setSuccess(true);
      setTimeout(() => {
        if (role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/marketplace');
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Container>
        <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

        <AuthCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.85rem', color: '#555555' }}>
              Login to access KisaanConnect marketplace
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
            <InputGroup>
              <label>Phone Number</label>
              <div className="input-wrap">
                <Phone size={16} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </InputGroup>

            <InputGroup>
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </InputGroup>

            <MagneticButton type="submit" disabled={loading} size="lg" style={{ width: '100%', marginTop: '1rem' }}>
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Success! Redirecting...</span>
                </>
              ) : (
                <span>{loading ? 'Logging in...' : 'Sign In'}</span>
              )}
            </MagneticButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#555555' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1B4332', fontWeight: 700 }}>
              Register Here
            </Link>
          </div>
        </AuthCard>
      </Container>
    </PageTransition>
  );
};

export default Login;
