import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import LiveStatusBadge from '../components/LiveStatusBadge';
import Toast from '../components/Toast';
import { getBuyerOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useOrderUpdates } from '../api/ws';
import { Container, Section, Card, Grid, Badge } from '../styles/primitives';

const OrderCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.75rem;
`;

const OrderDetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  .val {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function BuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getBuyerOrders(user.id);
      setOrders(data);
    } catch {
      setErrorMsg('Failed to load buyer orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  // Realtime order status updates via native WebSocket
  useOrderUpdates(user?.id, (update) => {
    if (update.event === 'order_update' && update.order_id) {
      setOrders((prev) =>
        prev.map((o) => (o.id === update.order_id ? { ...o, status: update.status } : o))
      );
      setToastMsg(`Order #${update.order_id} status updated to: ${update.status}`);
    }
  });

  return (
    <PageTransition>
      <Container>
        <Section>
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
          <Toast message={toastMsg} type="info" onClose={() => setToastMsg('')} />

          <div style={{ marginBottom: '2rem' }}>
            <Badge>Buyer History</Badge>
            <h1 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>Your Orders</h1>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching your orders..." />
          ) : orders.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No Orders Found</h3>
              <p style={{ color: '#555555', marginTop: '0.5rem' }}>
                Browse the marketplace to place direct orders with local farmers.
              </p>
            </Card>
          ) : (
            <Grid $cols={2}>
              <AnimatePresence>
                {orders.map((order) => (
                  <OrderCard key={order.id} layout>
                    <OrderHeader>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#555555' }}>Order ID</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>#{order.id.slice(0, 8)}</h3>
                      </div>
                      <LiveStatusBadge status={order.status} />
                    </OrderHeader>

                    <OrderDetailRow>
                      <span>Quantity Ordered</span>
                      <span className="val">{order.quantity_ordered_kg} kg</span>
                    </OrderDetailRow>

                    <OrderDetailRow>
                      <span>Total Amount</span>
                      <span className="val" style={{ fontSize: '1.25rem', color: '#40916C' }}>
                        ₹{order.total_price}
                      </span>
                    </OrderDetailRow>

                    {order.delivery_distance_km && (
                      <OrderDetailRow>
                        <span>Delivery Distance</span>
                        <span>{order.delivery_distance_km} km ({order.estimated_delivery_days} days)</span>
                      </OrderDetailRow>
                    )}
                  </OrderCard>
                ))}
              </AnimatePresence>
            </Grid>
          )}
        </Section>
      </Container>
    </PageTransition>
  );
}
