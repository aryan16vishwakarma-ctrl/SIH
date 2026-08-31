import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Grid as GridIcon } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ProductCard from '../components/ProductCard';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { getProducts } from '../api/products';
import { Container, Section, Badge } from '../styles/primitives';

const MarketplaceHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CategoryPills = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
`;

const Pill = styled.button`
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PillActiveBackground = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => `${theme.colors.accent}20`};
  border: 1px solid ${({ theme }) => `${theme.colors.accent}40`};
  border-radius: ${({ theme }) => theme.radii.full};
  z-index: -1;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  min-width: 260px;

  input {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.bgCard};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMain};
    outline: none;
    transition: border-color 0.15s;

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
`;

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProductGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MapContainerBox = styled.div`
  height: 600px;
  position: sticky;
  top: 5.5rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: 1024px) {
    height: 400px;
    position: relative;
    top: 0;
  }
`;

const categories = [
  { id: 'all', label: 'All Crops 🌾' },
  { id: 'vegetables', label: 'Vegetables 🥬' },
  { id: 'grains', label: 'Grains 🌾' },
  { id: 'fruits', label: 'Fruits 🍎' },
  { id: 'dairy', label: 'Dairy 🥛' },
  { id: 'pulses', label: 'Pulses 🫘' },
];

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMarketplaceProducts();
  }, [selectedCategory, searchQuery]);

  const fetchMarketplaceProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await getProducts(params);
      setProducts(data);
      if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0]);
      }
    } catch {
      setErrorMsg('Failed to load marketplace products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Container>
        <Section>
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

          <MarketplaceHeader>
            <div>
              <Badge>Direct Farmer Marketplace</Badge>
              <h1 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>Fresh Farm Harvests</h1>
            </div>

            <FilterRow>
              <CategoryPills>
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <Pill key={cat.id} $active={isActive} onClick={() => setSelectedCategory(cat.id)}>
                      {cat.label}
                      {isActive && (
                        <PillActiveBackground
                          layoutId="category-active-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Pill>
                  );
                })}
              </CategoryPills>

              <SearchInputWrapper>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search crop or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchInputWrapper>
            </FilterRow>
          </MarketplaceHeader>

          {loading ? (
            <LoadingSpinner message="Fetching direct farm listings..." />
          ) : (
            <SplitLayout>
              <ProductGrid
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                <AnimatePresence>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={selectedProduct?.id === product.id}
                      onSelect={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </AnimatePresence>
              </ProductGrid>

              <MapContainerBox>
                <MapView
                  products={products}
                  selectedProductId={selectedProduct?.id}
                  onMarkerClick={(p) => setSelectedProduct(p)}
                />
              </MapContainerBox>
            </SplitLayout>
          )}
        </Section>
      </Container>
    </PageTransition>
  );
};

export default Marketplace;
