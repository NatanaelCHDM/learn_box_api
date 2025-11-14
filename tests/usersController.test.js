const fs = require('fs');
const bcrypt = require('bcrypt');
const usersController = require('../src/controllers/usersController');

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
  res.location = jest.fn().mockReturnValue(res);
  return res;
}

// 🔹 Réinitialise la fausse DB avant chaque test
beforeEach(() => {
  mockDB = { users: [] };
});

describe('usersController', () => {
  describe('createUser', () => {
    it('should return 400 if username or password missing', async () => {
      const req = { body: { username: '' } };
      const res = mockRes();
      await usersController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'username and password required' });
    });

    it('should create a user and hash the password', async () => {
      const req = { body: { username: 'test', password: '12345678' } };
      const res = mockRes();
      await usersController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, username: 'test', levelAccess: 'user' })
      );

      // Vérifie que le mot de passe est bien hashé
      expect(mockDB.users[0].password).not.toBe('12345678');
      const valid = await bcrypt.compare('12345678', mockDB.users[0].password);
      expect(valid).toBe(true);
    });

    it('should not allow duplicate usernames', async () => {
      const req1 = { body: { username: 'test', password: '12345678' } };
      const res1 = mockRes();
      await usersController.createUser(req1, res1);

      const req2 = { body: { username: 'test', password: '87654321' } };
      const res2 = mockRes();
      await usersController.createUser(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(409);
      expect(res2.json).toHaveBeenCalledWith({ error: 'Utilisateur déjà existant' });
    });
  });

  describe('getUser', () => {
    it('should return 404 if user not found', () => {
      const req = { params: { id: 999 } };
      const res = mockRes();
      usersController.getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'user not found' });
    });

    it('should return user without password', () => {
      mockDB = { users: [{ id: 1, username: 'test', password: 'hashed', levelAccess: 'user' }] };

      const req = { params: { id: 1 } };
      const res = mockRes();
      usersController.getUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'test', levelAccess: 'user' });
    });
  });

  describe('updateUser', () => {
    it('should return 404 if user not found', async () => {
      const req = { params: { id: 1 }, body: {} };
      const res = mockRes();
      await usersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should update user and hash new password', async () => {
      const hashedOld = await bcrypt.hash('oldpass', 10);
      mockDB = { users: [{ id: 1, username: 'old', password: hashedOld, levelAccess: 'user' }] };

      const req = { params: { id: 1 }, body: { password: 'newpass123', levelAccess: 'admin' } };
      const res = mockRes();
      await usersController.updateUser(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: 'old', levelAccess: 'admin' }));

      const valid = await bcrypt.compare('newpass123', mockDB.users[0].password);
      expect(valid).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should return 404 if user not found', () => {
      const req = { params: { id: 1 }, user: { username: 'admin' } };
      const res = mockRes();
      usersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should delete user successfully', () => {
      mockDB = { users: [{ id: 1, username: 'test', password: 'hashed', levelAccess: 'user' }] };

      const req = { params: { id: 1 }, user: { username: 'admin' } };
      const res = mockRes();
      usersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: `L'utilisateur "test" a été supprimé par "admin".`
      });

      expect(mockDB.users.length).toBe(0);
    });
  });
});
