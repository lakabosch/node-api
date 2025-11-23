const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { createTestUser, generateUserData, generateAuthToken } = require('./factories');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = generateUserData({ email: 'newuser@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', userData.name);
      expect(response.body).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should not register user with duplicate email', async () => {
      const userData = generateUserData({ email: 'duplicate@example.com' });
      
      // Create first user
      await createTestUser({ email: 'duplicate@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Please add a name');
      expect(response.body.message).toContain('Please add an email');
      expect(response.body.message).toContain('Please add a password');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const userData = generateUserData({ email: 'login@example.com' });
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user._id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', user._id.toString());
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
    });
  });
});