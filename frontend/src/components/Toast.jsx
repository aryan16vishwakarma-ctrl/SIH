import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  max-width: 400px;
  border-radius: ${({ theme }) => theme.radii.md};
  backdrop-filter: blur(16px);
  box-shadow: ${({ theme }) => theme.shadows.xl};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;

  background: ${({ $type, theme }) =>
    $type === 'success'
      ? 'rgba(27, 67, 50, 0.92)'
      : $type === 'error'
      ? 'rgba(220, 38, 38, 0.92)'
      : 'rgba(15, 23, 42, 0.92)'};

  color: #ffffff;
  border: 1px solid
    ${({ $type, theme }) =>
      $type === 'success'
        ? theme.colors.accent
        : $type === 'error'
        ? '#f87171'
        : theme.colors.ondcBlue};
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (message && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <AnimatePresence>
      <ToastContainer
        $type={type}
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
      >
        <Icon size={20} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
        {onClose && (
          <CloseButton onClick={onClose}>
            <X size={16} />
          </CloseButton>
        )}
      </ToastContainer>
    </AnimatePresence>
  );
};

export default Toast;
