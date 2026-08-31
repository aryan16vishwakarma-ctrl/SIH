import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${({ $size }) => ($size === 'sm' ? '0.5rem 1rem' : $size === 'lg' ? '0.85rem 2rem' : '0.75rem 1.5rem')};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ $size, theme }) => ($size === 'sm' ? theme.fontSizes.xs : theme.fontSizes.sm)};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  outline: none;
  transition: box-shadow ${({ theme }) => theme.transitions.fast}, background ${({ theme }) => theme.transitions.fast};

  background: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? theme.colors.secondary
      : $variant === 'outline'
      ? 'transparent'
      : $variant === 'dark'
      ? theme.colors.primary
      : theme.colors.accent};

  color: ${({ theme, $variant }) =>
    $variant === 'outline' ? theme.colors.primary : '#ffffff'};

  border: ${({ theme, $variant }) =>
    $variant === 'outline' ? `2px solid ${theme.colors.primary}` : 'none'};

  box-shadow: ${({ theme, $variant }) =>
    $variant === 'secondary'
      ? '0 4px 14px rgba(233, 162, 59, 0.35)'
      : $variant === 'outline'
      ? 'none'
      : '0 4px 14px rgba(64, 145, 108, 0.35)'};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const MagneticButton = ({ children, onClick, type = 'button', disabled = false, variant = 'primary', size = 'md', ...props }) => {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.15);
    y.set(distanceY * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <StyledButton
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      $variant={variant}
      $size={size}
      style={{ x: springX, y: springY }}
      whileHover={shouldReduceMotion || disabled ? {} : { scale: 1.04 }}
      whileTap={shouldReduceMotion || disabled ? {} : { scale: 0.95 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default MagneticButton;
