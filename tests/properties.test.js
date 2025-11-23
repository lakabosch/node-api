const request = require('supertest');
const app = require('../server');
const Property = require('../models/Property');
const { 
  createTestUser, 
  createTestProperty, 
  generatePropertyData, 
  generateAuthToken,
  getAuthHeaders 
} = require('./factories');

describe('Property Controller', () => {
  describe('GET /api/properties', () => {
    it('should get all properties', async () => {
      await createTestProperty();
      await createTestProperty();

      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('price');
    });

    it('should filter properties by type', async () => {
      const user = await createTestUser();
      
      await createTestProperty({ user: user._id, type: 'house' });
      await createTestProperty({ user: user._id, type: 'apartment' });

      const response = await request(app)
        .get('/api/properties?type=house')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('house');
    });

    it('should paginate properties', async () => {
      // Create multiple properties
      const user = await createTestUser();
      for (let i = 0; i < 15; i++) {
        await createTestProperty({ 
          user: user._id,
          title: `Property ${i}`
        });
      }

      const response = await request(app)
        .get('/api/properties?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('next');
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get single property', async () => {
      const { property } = await createTestProperty();

      const response = await request(app)
        .get(`/api/properties/${property._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(property._id.toString());
      expect(response.body.data.title).toBe(property.title);
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = '64d5f6a5e4b0c9a1b8f7c3a2';
      
      const response = await request(app)
        .get(`/api/properties/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Property not found');
    });

    it('should return 400 for invalid property ID', async () => {
      const response = await request(app)
        .get('/api/properties/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/properties', () => {
    it('should create a new property', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user._id);
      const propertyData = generatePropertyData(user._id);

      const response = await request(app)
        .post('/api/properties')
        .set(getAuthHeaders(token))
        .send(propertyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(propertyData.title);
      expect(response.body.data.user).toBe(user._id.toString());
    });

    it('should not create property without authentication', async () => {
      const propertyData = generatePropertyData('fake-user-id');

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should validate required fields', async () => {
      const user = await createTestUser();
      const token = generateAuthToken(user._id);

      const response = await request(app)
        .post('/api/properties')
        .set(getAuthHeaders(token))
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Please add a title');
      expect(response.body.message).toContain('Please add a description');
      expect(response.body.message).toContain('Please add a price');
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update property', async () => {
      const { property, user } = await createTestProperty();
      const token = generateAuthToken(user._id);

      const updates = {
        title: 'Updated Property Title',
        price: 400000
      };

      const response = await request(app)
        .put(`/api/properties/${property._id}`)
        .set(getAuthHeaders(token))
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.price).toBe(updates.price);
    });

    it('should not update property of another user', async () => {
      const { property } = await createTestProperty();
      const anotherUser = await createTestUser({ email: 'another@example.com' });
      const token = generateAuthToken(anotherUser._id);

      const response = await request(app)
        .put(`/api/properties/${property._id}`)
        .set(getAuthHeaders(token))
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized to update this property');
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete property', async () => {
      const { property, user } = await createTestProperty();
      const token = generateAuthToken(user._id);

      const response = await request(app)
        .delete(`/api/properties/${property._id}`)
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({});

      // Verify property is deleted
      const deletedProperty = await Property.findById(property._id);
      expect(deletedProperty).toBeNull();
    });

    it('should not delete property of another user', async () => {
      const { property } = await createTestProperty();
      const anotherUser = await createTestUser({ email: 'another@example.com' });
      const token = generateAuthToken(anotherUser._id);

      const response = await request(app)
        .delete(`/api/properties/${property._id}`)
        .set(getAuthHeaders(token))
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized to delete this property');
    });
  });

  describe('GET /api/properties/user/:userId', () => {
    it('should get properties by user', async () => {
      const user = await createTestUser();
      await createTestProperty({ user: user._id });
      await createTestProperty({ user: user._id });

      const response = await request(app)
        .get(`/api/properties/user/${user._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(property => {
        expect(property.user).toBe(user._id.toString());
      });
    });
  });
});