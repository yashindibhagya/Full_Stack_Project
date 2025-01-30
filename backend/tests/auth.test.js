const request = require('supertest');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  describe('POST /signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully.');
      
      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Test User');
    });

    it('should not create user with existing email', async () => {
      // First create a user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: hashedPassword
      });

      // Try to create another user with same email
      const res = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already exists.');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user before each test
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid password.');
    });
  });
});