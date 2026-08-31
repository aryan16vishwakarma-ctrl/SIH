import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import LiveStatusBadge from '../components/LiveStatusBadge';
import Toast from '../components/Toast';
import { getFarmerOrders, updateOrderStatus } from '../api/orders';
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

const ActionSelect = styled.select`
  padding: 0.4rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgMain};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  outline: none;
`;

export default function FarmerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getFarmerOrders(user.id);
      setOrders(data);
    } catch {
      setErrorMsg('Failed to load farmer orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  // Realtime order updates via WebSocket
  useOrderUpdates(user?.id, (update) => {
    if (update.event === 'order_update' && update.order_id) {
      setOrders((prev) =>
        prev.map((o) => (o.id === update.order_id ? { ...o, status: update.status } : o))
      );
      setToastMsg(`Live Update: Order #${update.order_id} is now ${update.status}`);
    }
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setToastMsg(`Status changed to ${newStatus}`);
    } catch {
      setErrorMsg('Failed to update order status');
    }
  };

  return (
    <PageTransition>
      <Container>
        <Section>
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
          <Toast message={toastMsg} type="info" onClose={() => setToastMsg('')} />

          <div style={{ marginBottom: '2rem' }}>
            <Badge>Orders Received</Badge>
            <h1 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>Direct Buyer Orders</h1>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching received orders..." />
          ) : orders.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No Received Orders</h3>
              <p style={{ color: '#555555', marginTop: '0.5rem' }}>
                Orders placed by buyers for your crop listings will appear here.
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span>Quantity</span>
                      <strong style={{ color: '#1B4332' }}>{order.quantity_ordered_kg} kg</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span>Earnings</span>
                      <strong style={{ color: '#40916C', fontSize: '1.25rem' }}>₹{order.total_price}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(27,67,50,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555555' }}>Update Status:</span>
                      <ActionSelect
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </ActionSelect>
                    </div>
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
