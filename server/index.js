require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const iaasRoutes = require('./routes/IaaSRoutes');
const loginRoutes = require('./routes/LoginRoutes');
const emailVerificationRoutes = require('./routes/EmailVerificationRoutes');



const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/api', iaasRoutes);
app.use('/api', loginRoutes);
app.use('/api', emailVerificationRoutes);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

console.log('MONGODB_URI:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/health', (req, res) => res.send('Mastercard IaaS Server is running'));

server.listen(PORT, () => {
  console.log(`Mastercard IaaS Server running on port ${PORT}`);
  console.log(`Socket.IO available at ws://localhost:${PORT}`);
});

module.exports = app;