import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, CheckCircle, Zap } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import MagneticButton from './MagneticButton';

const BadgeContainer = styled(motion.div)`
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme, $accepted }) => ($accepted ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $accepted }) => ($accepted ? 'rgba(64, 145, 108, 0.1)' : theme.colors.bgCard)};
  box-shadow: ${({ theme, $accepted }) => ($accepted ? theme.shadows.glow : theme.shadows.md)};
  position: relative;
  overflow: hidden;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const TitleBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .icon-wrap {
    padding: 0.5rem;
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => `${theme.colors.accent}20`};
    color: ${({ theme }) => theme.colors.accent};
  }

  .title {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subtitle {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Tag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => `${theme.colors.accent}20`};
  color: ${({ theme }) => theme.colors.accent};
`;

const ExtraGain = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => `${theme.colors.accent}20`};
  color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PriceCard = styled.div`
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $highlight, theme }) => ($highlight ? `${theme.colors.accent}10` : theme.colors.bgMain)};
  border: 1px solid ${({ $highlight, theme }) => ($highlight ? `${theme.colors.accent}40` : theme.colors.border)};

  .label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 500;
  }

  .value {
    font-size: ${({ $highlight, theme }) => ($highlight ? '1.75rem' : '1.35rem')};
    font-weight: 800;
    color: ${({ $highlight, theme }) => ($highlight ? theme.colors.accent : theme.colors.textMain)};
    margin: 0.25rem 0;
    text-decoration: ${({ $strikethrough }) => ($strikethrough ? 'line-through' : 'none')};
  }

  .sub {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textDim};
  }
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PriceComparisonBadge = ({ pricing, onAccept, accepted = false }) => {
  if (!pricing) return null;

  const fairPrice = pricing.fair_farmer_price || pricing.fair_price_max || 30;
  const mandiRef = pricing.mandi_reference_price || fairPrice * 0.75;
  const consumerPrice = pricing.expected_consumer_price || fairPrice * 1.35;
  const gainPercent = Math.round(((fairPrice - mandiRef) / mandiRef) * 100);

  return (
    <BadgeContainer
      $accepted={accepted}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <HeaderRow>
        <TitleBox>
          <div className="icon-wrap">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="title">
              <span>AI Mandi Price Intelligence</span>
              {pricing.source && <Tag>{pricing.source}</Tag>}
            </div>
            <div className="subtitle">Regional direct-to-buyer fair market analysis</div>
          </div>
        </TitleBox>

        {gainPercent > 0 && (
          <ExtraGain>
            <TrendingUp size={14} />
            <span>+{gainPercent}% Farmer Extra Earnings</span>
          </ExtraGain>
        )}
      </HeaderRow>

      <Grid>
        <PriceCard $highlight>
          <div className="label">Suggested Fair Price</div>
          <div className="value">
            ₹<AnimatedCounter value={Math.round(fairPrice)} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}> / kg</span>
          </div>
          <div className="sub">
            Range: ₹{pricing.fair_price_min || Math.round(fairPrice * 0.9)} - ₹{pricing.fair_price_max || Math.round(fairPrice * 1.1)}
          </div>
        </PriceCard>

        <PriceCard $strikethrough>
          <div className="label">Traditional Mandi Price</div>
          <div className="value">
            ₹<AnimatedCounter value={Math.round(mandiRef)} />
            <span style={{ fontSize: '0.75rem', fontWeight: 400 }}> / kg</span>
          </div>
          <div className="sub">Middleman benchmark</div>
        </PriceCard>

        <PriceCard>
          <div className="label">Traditional Retail Price</div>
          <div className="value">
            ₹<AnimatedCounter value={Math.round(consumerPrice)} />
            <span style={{ fontSize: '0.75rem', fontWeight: 400 }}> / kg</span>
          </div>
          <div className="sub">Consumer retail cost</div>
        </PriceCard>
      </Grid>

      <FooterRow>
        <div style={{ fontSize: '0.75rem', color: '#555555', fontWeight: 500 }}>
          {pricing.savings_message || 'Direct farmer sale eliminates middleman margins.'}
        </div>

        {onAccept && (
          <MagneticButton
            type="button"
            onClick={() => onAccept(fairPrice)}
            size="sm"
            variant={accepted ? 'primary' : 'secondary'}
          >
            {accepted ? (
              <>
                <CheckCircle size={14} />
                <span>Price Auto-Filled!</span>
              </>
            ) : (
              <>
                <Zap size={14} />
                <span>Apply AI Fair Price</span>
              </>
            )}
          </MagneticButton>
        )}
      </FooterRow>
    </BadgeContainer>
  );
};

export default PriceComparisonBadge;
