import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface WebSocketHook {
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
}

const useWebSocket = (url: string): WebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  const lastMessageRef = useRef<WebSocketMessage | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      isConnectedRef.current = true;
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      isConnectedRef.current = false;
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        lastMessageRef.current = message;
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  return {
    sendMessage,
    lastMessage: lastMessageRef.current,
    isConnected: isConnectedRef.current,
  };
};

export default useWebSocket; 