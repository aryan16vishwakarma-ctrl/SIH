import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, Users, Sprout, Store, Truck, Sparkles } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MagneticButton from '../components/MagneticButton';
import AnimatedCounter from '../components/AnimatedCounter';
import HeroScene3D from '../components/HeroScene3D';
import { Container, Section, Card, Grid, Badge } from '../styles/primitives';

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 3rem;
  align-items: center;
  padding: 3rem 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Headline = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 1rem;
  margin-bottom: 1.25rem;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const CtaGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ThreeSceneBox = styled.div`
  height: 440px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: radial-gradient(circle at center, rgba(64, 145, 108, 0.15), transparent 70%);
  position: relative;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const StatsStrip = styled.div`
  margin: 3rem 0;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  text-align: center;

  .number {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    color: ${({ theme }) => theme.colors.accent};
  }

  .label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.25rem;
  }
`;

const StepCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .step-icon {
    width: 3rem;
    height: 3rem;
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => `${theme.colors.accent}15`};
    color: ${({ theme }) => theme.colors.accent};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-title {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }

  .step-desc {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;
  }
`;

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] },
  }),
};

const Landing = () => {
  const words = ['Sell', 'direct.', 'Earn', 'fair.', 'No', 'middlemen.'];

  const steps = [
    {
      icon: Sprout,
      title: '1. Farmer Lists Crop',
      desc: 'Farmers quickly add harvest details with location coordinates and quantity in kilograms.',
    },
    {
      icon: Sparkles,
      title: '2. AI Mandi Price Engine',
      desc: 'Groq Llama-3.3 AI analyzes regional market data to compute a fair direct price instantly.',
    },
    {
      icon: Truck,
      title: '3. Direct Buyer Order',
      desc: 'Consumers and bulk buyers order directly with Haversine distance routing & ONDC readiness.',
    },
  ];

  return (
    <PageTransition>
      <Container>
        <Section>
          <HeroGrid>
            <div>
              <Badge $variant="ondc">
                <Sparkles size={14} />
                <span>SIH Problem Statement 26033 Solution</span>
              </Badge>

              <Headline>
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariants}
                    style={{ display: 'inline-block', marginRight: '0.5rem' }}
                  >
                    {word}
                  </motion.span>
                ))}
              </Headline>

              <Subtitle>
                Empowering Indian farmers by removing intermediaries. Direct fair pricing powered by AI intelligence and seamless buyer fulfillment.
              </Subtitle>

              <CtaGroup>
                <Link to="/register?role=farmer">
                  <MagneticButton size="lg">
                    <Sprout size={20} />
                    <span>I'm a Farmer</span>
                  </MagneticButton>
                </Link>
                <Link to="/register?role=buyer">
                  <MagneticButton size="lg" variant="secondary">
                    <Store size={20} />
                    <span>I'm a Buyer</span>
                  </MagneticButton>
                </Link>
              </CtaGroup>
            </div>

            <ThreeSceneBox>
              <HeroScene3D />
            </ThreeSceneBox>
          </HeroGrid>

          {/* Stats Strip */}
          <StatsStrip>
            <StatItem>
              <div className="number">
                +<AnimatedCounter value={40} />%
              </div>
              <div className="label">Farmer Earnings Increase</div>
            </StatItem>

            <StatItem>
              <div className="number">
                <AnimatedCounter value={35} />%
              </div>
              <div className="label">Cheaper Retail Price</div>
            </StatItem>

            <StatItem>
              <div className="number">
                <AnimatedCounter value={1000} />+
              </div>
              <div className="label">Farmers Onboarded</div>
            </StatItem>
          </StatsStrip>
        </Section>

        {/* How It Works Section */}
        <Section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Badge>Direct Marketplace Flow</Badge>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>How KisaanConnect Works</h2>
          </div>

          <Grid $cols={3}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <StepCard
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="step-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </StepCard>
              );
            })}
          </Grid>
        </Section>
      </Container>
    </PageTransition>
  );
};

export default Landing;
