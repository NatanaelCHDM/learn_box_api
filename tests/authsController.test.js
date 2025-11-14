const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../src/controllers/authsController');

// 🔹 FAUSSE DB EN MEMOIRE
let mockDB = { users: [] };

// 🔹 MOCK FS pour les tests
jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(mockDB));
jest.spyOn(fs, 'writeFileSync').mockImplementation((path, data) => {
  mockDB = JSON.parse(data);
});

// 🔹 Fonction utilitaire pour simuler res
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// 🔹 Réinitialisation avant chaque test
beforeEach(() => {
  mockDB = { users: [] };
});

describe('authsController', () => {
  describe('register', () => {
    it('should reject missing username/password', async () => {
      const req = { body: { username: '', password: '' } };
      const res = mockRes();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject password shorter than 8 chars', async () => {
      const req = { body: { username: 'user1', password: 'short' } };
      const res = mockRes();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    });

    it('should create user successfully', async () => {
      const req = { body: { username: 'user1', password: 'longpassword' } };
      const res = mockRes();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockDB.users[0].username).toBe('user1');
    });

    it('should reject duplicate username', async () => {
      mockDB = { users: [{ id: 1, username: 'user1', password: 'hash', levelAccess: 'user' }] };
      const req = { body: { username: 'user1', password: 'anotherlong' } };
      const res = mockRes();
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('login', () => {
    it('should reject missing credentials', async () => {
      const req = { body: {} };
      const res = mockRes();
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid username/password', async () => {
      const hashed = await bcrypt.hash('mypassword', 10);
      mockDB = { users: [{ id: 1, username: 'user1', password: hashed, levelAccess: 'user' }] };

      const req1 = { body: { username: 'unknown', password: 'mypassword' } };
      const res1 = mockRes();
      await authController.login(req1, res1);
      expect(res1.status).toHaveBeenCalledWith(401);

      const req2 = { body: { username: 'user1', password: 'wrong' } };
      const res2 = mockRes();
      await authController.login(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(401);
    });

    it('should return access and refresh tokens', async () => {
      const hashed = await bcrypt.hash('mypassword', 10);
      mockDB = { users: [{ id: 1, username: 'user1', password: hashed, levelAccess: 'user' }] };

      const req = { body: { username: 'user1', password: 'mypassword' } };
      const res = mockRes();
      await authController.login(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: expect.any(String), refreshToken: expect.any(String) })
      );
    });
  });

  describe('refresh', () => {
    it('should reject missing refresh token', () => {
      const req = { body: {} };
      const res = mockRes();
      authController.refresh(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should issue new access token with valid refresh token', () => {
      const payload = { id: 1, username: 'user1', levelAccess: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const req = { body: { refreshToken: token } };
      const res = mockRes();
      authController.refresh(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: expect.any(String) })
      );
    });
  });

  describe('logout', () => {
    it('should return logout message', () => {
      const req = {};
      const res = mockRes();
      authController.logout(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Déconnecté avec succès' });
    });
  });
});
