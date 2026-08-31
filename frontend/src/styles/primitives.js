import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

export const Section = styled.section`
  padding: 4rem 0;
  position: relative;

  @media (max-width: 768px) {
    padding: 2.5rem 0;
  }
`;

export const Card = styled(motion.div)`
  background: ${({ theme, $variant }) =>
    $variant === 'dark'
      ? theme.colors.bgDarkCard
      : $variant === 'glass'
      ? 'rgba(255, 255, 255, 0.85)'
      : theme.colors.bgCard};
  backdrop-filter: ${({ $variant }) => ($variant === 'glass' ? 'blur(16px)' : 'none')};
  border: 1px solid ${({ theme, $variant }) =>
    $variant === 'dark' ? theme.colors.borderLight : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.75rem;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: box-shadow ${({ theme }) => theme.transitions.default}, border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    box-shadow: ${({ theme, $hoverable }) => ($hoverable ? theme.shadows.lg : theme.shadows.md)};
  }
`;

export const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  gap: ${({ $gap }) => $gap || '1.5rem'};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(${({ $cols }) => Math.min($cols || 3, 2)}, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: ${({ $direction }) => $direction || 'column'};
  gap: ${({ $gap }) => $gap || '1rem'};
  align-items: ${({ $align }) => $align || 'stretch'};
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? `${theme.colors.secondary}20`
      : $variant === 'ondc'
      ? `${theme.colors.ondcBlue}20`
      : $variant === 'danger'
      ? `${theme.colors.error}20`
      : `${theme.colors.accent}20`};
  color: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? theme.colors.secondary
      : $variant === 'ondc'
      ? theme.colors.ondcBlue
      : $variant === 'danger'
      ? theme.colors.error
      : theme.colors.accent};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'secondary'
        ? `${theme.colors.secondary}40`
        : $variant === 'ondc'
        ? `${theme.colors.ondcBlue}40`
        : $variant === 'danger'
        ? `${theme.colors.error}40`
        : `${theme.colors.accent}40`};
`;
