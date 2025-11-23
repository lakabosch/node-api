const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Route files
const properties = require('./routes/properties');
const auth = require('./routes/auth');

// Mount routers
app.use('/api/properties', properties);
app.use('/api/auth', auth);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Real Estate API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me'
      },
      properties: {
        getAll: 'GET /api/properties',
        getSingle: 'GET /api/properties/:id',
        create: 'POST /api/properties',
        update: 'PUT /api/properties/:id',
        delete: 'DELETE /api/properties/:id',
        byUser: 'GET /api/properties/user/:userId'
      }
    }
  });
});

// // Handle 404
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});