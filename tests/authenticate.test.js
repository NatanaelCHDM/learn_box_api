const jwt = require('jsonwebtoken');
const authenticate = require('../src/middlewares/authenticate');

function mockReq(headers = {}) {
  return { headers };
}
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
function mockNext() {
  return jest.fn();
}

describe('authenticate middleware', () => {
  it('should reject missing Authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Accès refusé : vous devez vous connecter à l'aide d'un token" });
  });

  it('should reject malformed header', () => {
    const req = mockReq({ authorization: 'BadToken' });
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Malformed Authorization header' });
  });

  it('should reject invalid token', () => {
    const req = mockReq({ authorization: 'Bearer invalidtoken' });
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should call next for valid token', () => {
    const payload = { id: 1, username: 'admin', levelAccess: 'admin' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();
    const next = mockNext();
    authenticate(req, res, next);
    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });
});
