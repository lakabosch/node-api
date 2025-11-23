const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/property');
const jwt = require('jsonwebtoken');

// Generate test user data
const generateUserData = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  phone: '+1234567890',
  role: 'user',
  ...overrides
});

// Generate test property data
const generatePropertyData = (userId, overrides = {}) => ({
  title: 'Beautiful Family Home',
  description: 'A beautiful family home in a quiet neighborhood',
  price: 350000,
  type: 'house',
  status: 'for-sale',
  bedrooms: 3,
  bathrooms: 2,
  area: 1800,
  address: {
    street: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'USA'
  },
  amenities: ['garden', 'garage', 'pool'],
  images: ['image1.jpg', 'image2.jpg'],
  yearBuilt: 2010,
  parking: 2,
  user: userId,
  ...overrides
});

// Create test user in database
const createTestUser = async (userData = {}) => {
  const user = await User.create(generateUserData(userData));
  return user;
};

// Create test property in database
const createTestProperty = async (propertyData = {}) => {
  let user;
  
  if (!propertyData.user) {
    user = await createTestUser();
    propertyData.user = user._id;
  }
  
  const property = await Property.create(generatePropertyData(propertyData.user, propertyData));
  return { property, user: user || await User.findById(propertyData.user) };
};

// Generate JWT token for authenticated requests
const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};

// Get auth headers for supertest requests
const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

module.exports = {
  generateUserData,
  generatePropertyData,
  createTestUser,
  createTestProperty,
  generateAuthToken,
  getAuthHeaders
};