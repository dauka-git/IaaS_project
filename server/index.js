require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });
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
  allowedHeaders: ['Content-Type', 'Authorization'],

  credentials: true
}));

app.use(express.json());

// Add root route for debugging
app.get('/', (req, res) => {
  res.json({
    message: 'Mastercard IaaS Server is running',
    endpoints: ['/register', '/login', '/health', '/applications']
  });
});

app.use('/', iaasRoutes);
app.use('/', loginRoutes);
app.use('/', emailVerificationRoutes);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    methods: ['GET', 'POST']
  }
});

// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('PYTHON_MICROSERVICE_URL:', process.env.PYTHON_MICROSERVICE_URL);

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set! Server will not start properly.');
}

mongoose.connect(process.env.MONGO_URI, {
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