import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledStatusBadge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.02em;

  background: ${({ $status, theme }) =>
    $status === 'completed' || $status === 'delivered'
      ? `${theme.colors.success}20`
      : $status === 'cancelled'
      ? `${theme.colors.error}20`
      : `${theme.colors.pending}20`};

  color: ${({ $status, theme }) =>
    $status === 'completed' || $status === 'delivered'
      ? theme.colors.success
      : $status === 'cancelled'
      ? theme.colors.error
      : theme.colors.pending};

  border: 1px solid
    ${({ $status, theme }) =>
      $status === 'completed' || $status === 'delivered'
        ? `${theme.colors.success}50`
        : $status === 'cancelled'
        ? `${theme.colors.error}50`
        : `${theme.colors.pending}50`};
`;

const PulseDot = styled(motion.span)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

export default function LiveStatusBadge({ status = 'pending' }) {
  return (
    <StyledStatusBadge
      $status={status.toLowerCase()}
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <PulseDot
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {status}
    </StyledStatusBadge>
  );
}
