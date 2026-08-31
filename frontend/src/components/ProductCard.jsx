import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CardWrapper = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
  box-shadow: ${({ theme, $selected }) => ($selected ? theme.shadows.glow : theme.shadows.md)};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  text-transform: capitalize;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => `${theme.colors.accent}15`};
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => `${theme.colors.accent}30`};
`;

const SavingsTag = styled(motion.span)`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => `${theme.colors.secondary}20`};
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => `${theme.colors.secondary}40`};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CropTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0.5rem;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0.25rem 0;

  .price {
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.accent};
  }

  .unit {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }

  .mandi {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textDim};
    text-decoration: line-through;
  }
`;

const MetadataBox = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CategoryEmojiMap = {
  vegetables: '🥬',
  grains: '🌾',
  fruits: '🍎',
  dairy: '🥛',
  pulses: '🫘',
};

const ProductCard = ({ product, isSelected = false, onSelect }) => {
  const farmer = product.farmer || {};
  const emoji = CategoryEmojiMap[product.category] || '🌱';

  const mandiPrice = product.mandi_reference_price || product.price_per_kg * 0.75;
  const expectedRetail = product.price_per_kg * 1.35;
  const savingsPerKg = Math.max(0, Math.round(expectedRetail - product.price_per_kg));

  return (
    <CardWrapper
      layoutId={`product-card-${product.id}`}
      whileHover={{ y: -6 }}
      onClick={() => onSelect && onSelect(product)}
      $selected={isSelected}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <CategoryBadge>
            <span>{emoji}</span>
            <span>{product.category}</span>
          </CategoryBadge>

          {savingsPerKg > 0 && (
            <SavingsTag
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <Tag size={12} />
              <span>Save ₹{savingsPerKg}/kg</span>
            </SavingsTag>
          )}
        </div>

        <CropTitle>{product.crop_name}</CropTitle>

        <PriceRow>
          <span className="price">₹{product.price_per_kg}</span>
          <span className="unit">/ kg</span>
          {mandiPrice && <span className="mandi">₹{Math.round(mandiPrice)} Mandi</span>}
        </PriceRow>

        <p style={{ fontSize: '0.75rem', color: '#555555', marginTop: '0.35rem', lineHeight: '1.4' }}>
          {product.description || 'Direct farm harvest with zero middleman markup.'}
        </p>

        <MetadataBox>
          <MetaRow>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#1B4332', fontWeight: 600 }}>
              <MapPin size={14} style={{ color: '#40916C' }} />
              {farmer.village || 'Farm'}, {farmer.district || 'District'}
            </span>
            {product.distance_km !== undefined && (
              <span style={{ color: '#40916C', fontWeight: 700 }}>
                {product.distance_km} km away
              </span>
            )}
          </MetaRow>

          <MetaRow>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} />
              Harvest: {product.harvest_date}
            </span>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>
              {product.quantity_kg} kg available
            </span>
          </MetaRow>
        </MetadataBox>
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(27,67,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: '#40916C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ShieldCheck size={14} />
          Direct Farmer Deal
        </span>
        <Link
          to={`/product/${product.id}`}
          style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1B4332', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </CardWrapper>
  );
};

export default ProductCard;
