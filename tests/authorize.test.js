const authorize = require('../src/middlewares/authorize'); // Middleware à tester

// Création d’un faux objet réponse Express (res)
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Fonction factice pour simuler "next()" dans Express
const next = jest.fn();

describe('Middleware: authorize', () => {

  beforeEach(() => {
    jest.clearAllMocks(); // Réinitialise tous les mocks avant chaque test
  });

  // Utilisateur non authentifié
  test('❌ Retourne 401 si req.user est absent', () => {
    const req = {}; // pas de user
    const res = mockResponse();

    const middleware = authorize('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Utilisateur non authentifié' });
    expect(next).not.toHaveBeenCalled();
  });

  // Utilisateur authentifié mais sans levelAccess
  test('❌ Retourne 401 si req.user.levelAccess est absent', () => {
    const req = { user: {} };
    const res = mockResponse();

    const middleware = authorize('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Utilisateur non authentifié' });
    expect(next).not.toHaveBeenCalled();
  });

  // Rôle insuffisant
  test('❌ Retourne 403 si le rôle de l’utilisateur est insuffisant', () => {
    const req = { user: { levelAccess: 'user' } };
    const res = mockResponse();

    const middleware = authorize('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès refusé — rôle insuffisant' });
    expect(next).not.toHaveBeenCalled();
  });

  // Rôle suffisant
  test('✅ Passe au middleware suivant si le rôle correspond', () => {
    const req = { user: { levelAccess: 'admin' } };
    const res = mockResponse();

    const middleware = authorize('admin');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();      // next() doit être appelé
    expect(res.status).not.toHaveBeenCalled(); // aucune erreur envoyée
  });

  // Rôle exact requis
  test('✅ Passe si le rôle exact requis est respecté', () => {
    const req = { user: { levelAccess: 'technician' } };
    const res = mockResponse();

    const middleware = authorize('technician');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

});
