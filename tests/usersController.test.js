// Import du module à tester
const usersController = require('../src/controllers/usersController');

// Fonction utilitaire pour créer des objets req/res simulés
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.location = jest.fn().mockReturnValue(res);
  return res;
};

// Avant chaque test, on réinitialise le module (et donc le tableau users)
beforeEach(() => {
  jest.resetModules();
});

describe('Users Controller', () => {

  // CREATE USER
  test('✅ createUser - crée un utilisateur valide', () => {
    const req = {
      body: { username: 'alice', password: '1234', levelAccess: 'admin' }
    };
    const res = mockResponse();

    usersController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(Number),
      username: 'alice',
      password: '1234',
      levelAccess: 'admin'
    }));
  });

  test('❌ createUser - champs manquants', () => {
    const req = { body: { username: 'bob' } };
    const res = mockResponse();

    usersController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'username and password required'
    });
  });

  // READ USER
  test('✅ getUser - retourne un utilisateur sans le mot de passe', () => {
    const reqCreate = { body: { username: 'charlie', password: 'pass' } };
    const resCreate = mockResponse();
    usersController.createUser(reqCreate, resCreate);
    const createdUser = resCreate.json.mock.calls[0][0];

    const req = { params: { id: createdUser.id.toString() } };
    const res = mockResponse();

    usersController.getUser(req, res);

    const returnedUser = res.json.mock.calls[0][0];
    expect(returnedUser).not.toHaveProperty('password');
    expect(returnedUser).toMatchObject({ id: createdUser.id, username: 'charlie' });
  });

  test('❌ getUser - utilisateur inexistant', () => {
    const req = { params: { id: '999' } };
    const res = mockResponse();

    usersController.getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'user not found' });
  });

  // UPDATE USER
  test('✅ updateUser - met à jour un utilisateur existant', () => {
    const reqCreate = { body: { username: 'david', password: 'pass' } };
    const resCreate = mockResponse();
    usersController.createUser(reqCreate, resCreate);
    const userId = resCreate.json.mock.calls[0][0].id;

    const req = {
      params: { id: userId.toString() },
      body: { password: 'newpass' }
    };
    const res = mockResponse();

    usersController.updateUser(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ password: 'newpass' }));
  });

  test('❌ updateUser - utilisateur non trouvé', () => {
    const req = { params: { id: '999' }, body: { password: 'newpass' } };
    const res = mockResponse();

    usersController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'user not found' });
  });

  // DELETE USER
  test('✅ deleteUser - supprime un utilisateur et indique l’admin', () => {
    const reqCreate = { body: { username: 'eve', password: 'pass' } };
    const resCreate = mockResponse();
    usersController.createUser(reqCreate, resCreate);
    const userId = resCreate.json.mock.calls[0][0].id;

    const req = {
      params: { id: userId.toString() },
      user: { username: 'AdminRoot' }
    };
    const res = mockResponse();

    usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining(`supprimé par "AdminRoot"`)
    });
  });

  test('✅ deleteUser - admin inconnu si non authentifié', () => {
    const reqCreate = { body: { username: 'frank', password: 'pass' } };
    const resCreate = mockResponse();
    usersController.createUser(reqCreate, resCreate);
    const userId = resCreate.json.mock.calls[0][0].id;

    const req = { params: { id: userId.toString() } };
    const res = mockResponse();

    usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining(`supprimé par "Unknown"`)
    });
  });

  test('❌ deleteUser - utilisateur non trouvé', () => {
    const req = { params: { id: '999' } };
    const res = mockResponse();

    usersController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

});
