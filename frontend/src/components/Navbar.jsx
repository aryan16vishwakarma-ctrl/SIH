import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Sprout, ShoppingBag, LayoutDashboard, PackageCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MagneticButton from './MagneticButton';

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 247, 240, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const NavInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIconBox = styled(motion.div)`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;

  .brand-title {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.25rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primary};

    span {
      color: ${({ theme }) => theme.colors.accent};
    }
  }

  .brand-sub {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.colors.secondary};
    margin-top: -0.2rem;
  }
`;

const NavList = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledNavLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActivePill = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => `${theme.colors.accent}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.accent}30`};
  border-radius: ${({ theme }) => theme.radii.md};
  z-index: -1;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 640px) {
    display: none;
  }

  .name {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }

  .role-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.1rem 0.4rem;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => `${theme.colors.accent}20`};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const IconButton = styled(motion.button)`
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => `${theme.colors.primary}08`};
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    border-color: ${({ theme }) => `${theme.colors.error}40`};
    background: ${({ theme }) => `${theme.colors.error}10`};
  }
`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag, show: true },
    {
      path: role === 'farmer' ? '/farmer/dashboard' : '/buyer/orders',
      label: role === 'farmer' ? 'Dashboard' : 'My Orders',
      icon: role === 'farmer' ? LayoutDashboard : PackageCheck,
      show: !!user,
    },
    {
      path: role === 'farmer' ? '/farmer/orders' : null,
      label: 'Orders Received',
      icon: PackageCheck,
      show: role === 'farmer',
    },
  ].filter((item) => item.show && item.path);

  return (
    <HeaderContainer>
      <NavInner>
        <LogoLink to="/">
          <LogoIconBox
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Sprout size={22} />
          </LogoIconBox>
          <LogoText>
            <span className="brand-title">
              Kisaan<span>Connect</span>
            </span>
            <span className="brand-sub">Direct Marketplace</span>
          </LogoText>
        </LogoLink>

        <NavList>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <StyledNavLink key={item.path} to={item.path} $active={isActive}>
                <Icon size={16} />
                <span>{item.label}</span>
                {isActive && (
                  <ActivePill
                    layoutId="navbar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </StyledNavLink>
            );
          })}
        </NavList>

        <UserActions>
          {user ? (
            <>
              <UserInfo>
                <span className="name">{user.name}</span>
                <span className="role-badge">{role}</span>
              </UserInfo>
              <IconButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={18} />
              </IconButton>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1B4332',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </motion.button>
              </Link>
              <Link to="/register">
                <MagneticButton size="sm">
                  <UserPlus size={16} />
                  <span>Register</span>
                </MagneticButton>
              </Link>
            </div>
          )}
        </UserActions>
      </NavInner>
    </HeaderContainer>
  );
};

export default Navbar;
