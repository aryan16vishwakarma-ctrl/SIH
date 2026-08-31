import { useEffect, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export function useOrderUpdates(userId, onUpdate) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let socket = null;
    let reconnectTimeout = null;

    const connect = () => {
      socket = new WebSocket(`${WS_BASE_URL}/api/ws/orders/${userId}`);

      socket.onopen = () => {
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onUpdate && typeof onUpdate === 'function') {
            onUpdate(data);
          }
        } catch {
          // ignore invalid parse
        }
      };

      socket.onclose = () => {
        setConnected(false);
        // Reconnect after 3s
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, [userId, onUpdate]);

  return connected;
}
