const authorize = require('../src/middlewares/authorize');

function mockReq(user) {
  return { user };
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

describe('authorize middleware', () => {
  it('should reject unauthenticated user', () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = mockNext();
    authorize('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should reject insufficient role', () => {
    const req = mockReq({ levelAccess: 'user' });
    const res = mockRes();
    const next = mockNext();
    authorize('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should call next for correct role', () => {
    const req = mockReq({ levelAccess: 'admin' });
    const res = mockRes();
    const next = mockNext();
    authorize('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
