import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(
  process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  { transports: ['websocket'] }
);
    const socket = socketRef.current;

    // Join personal room for targeted events
    socket.emit('join', user._id);

    // Admins also join the admin room for broadcast events
    if (user.role === 'admin') {
      socket.emit('joinAdmin');
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}

// Returns the socket ref so components can attach listeners
export const useSocket = () => useContext(SocketContext);
