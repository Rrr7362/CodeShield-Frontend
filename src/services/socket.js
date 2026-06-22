// socket.js
// Socket.IO client singleton.
// One instance for the entire application lifecycle.

import { io } from 'socket.io-client';

const socket = io(
  import.meta.env.VITE_API_URL || 'http://localhost:3000',
  {
    // Don't connect on import — connect explicitly
    // when a scan starts. Disconnect when done.
    autoConnect: false,

    // Reconnection strategy
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,   // jitter — prevents thundering herd
  }
);

// Global connection event logging
// These run regardless of which component is listening
socket.on('connect', () => {
  console.log(`[socket] Connected: ${socket.id}`);
});

socket.on('disconnect', (reason) => {
  console.log(`[socket] Disconnected: ${reason}`);
});

socket.on('connect_error', (err) => {
  console.error(`[socket] Connection error: ${err.message}`);
});

export default socket;