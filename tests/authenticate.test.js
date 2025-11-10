const jwt = require('jsonwebtoken'); // On mockera cette dépendance
const authenticate = require('../src/middlewares/authenticate'); // Middleware à tester

// Mock de la méthode jwt.verify pour contrôler son comportement dans les tests
jest.mock('jsonwebtoken');

// Création d’un faux objet réponse Express (res)
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Fonction factice pour simuler "next()" dans Express
const next = jest.fn();

describe('Middleware: authenticate', () => {

  beforeEach(() => {
    jest.clearAllMocks(); // Réinitialise tous les mocks avant chaque test
  });

  // Header manquant
  test('❌ Retourne 401 si le header Authorization est absent', () => {
    const req = { headers: {} };
    const res = mockResponse();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
    expect(next).not.toHaveBeenCalled();
  });

  // Header mal formé
  test('❌ Retourne 401 si le header est mal formé', () => {
    const req = { headers: { authorization: 'InvalidTokenFormat' } };
    const res = mockResponse();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Malformed Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  // Token invalide
  test('❌ Retourne 401 si le token est invalide', () => {
    const req = { headers: { authorization: 'Bearer faketoken' } };
    const res = mockResponse();

    // On simule un jeton invalide qui déclenche une erreur dans jwt.verify
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  // Token valide
  test('✅ Passe au middleware suivant si le token est valide', () => {
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = mockResponse();

    // Simule un token valide qui retourne un payload
    const fakePayload = { id: 1, username: 'testUser', levelAccess: 'admin' };
    jwt.verify.mockReturnValue(fakePayload);

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(req.user).toEqual(fakePayload);
    expect(next).toHaveBeenCalled(); // next() doit être appelé
    expect(res.status).not.toHaveBeenCalled(); // Aucune erreur
  });

  // Vérifie la casse du header (Authorization vs authorization)
  test('✅ Accepte les headers insensibles à la casse', () => {
    const req = { headers: { Authorization: 'Bearer tokenUppercaseHeader' } };
    const res = mockResponse();

    jwt.verify.mockReturnValue({ id: 2, username: 'uppercase' });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('tokenUppercaseHeader', process.env.JWT_SECRET);
    expect(req.user).toEqual({ id: 2, username: 'uppercase' });
    expect(next).toHaveBeenCalled();
  });

});
