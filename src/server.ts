import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { setupSocketHandlers } from './websocket/socket.handler';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏏 CRICKET AUCTION ARENA - BACKEND SERVER RUNNING 🏏`);
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server: Ready for real-time auction bids`);
  console.log(`====================================================`);
});

export { server, io };
