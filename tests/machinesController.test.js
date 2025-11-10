// Import du module à tester
const machinesController = require('../src/controllers/machinesController');

// Fonction utilitaire pour créer des objets req/res simulés
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.location = jest.fn().mockReturnValue(res);
  return res;
};

// Avant chaque test, on réinitialise le module pour repartir avec un tableau vide
beforeEach(() => {
  jest.resetModules();
});

describe('Machines Controller', () => {

  // CREATE MACHINE
  test('✅ createMachine - crée une machine valide', () => {
    const req = {
      body: { nameMachine: 'Machine A', statut: 'active', levelAccess: 2 }
    };
    const res = mockResponse();

    machinesController.createMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(Number),
      nameMachine: 'Machine A',
      statut: 'active',
      levelAccess: 2
    }));
  });

  test('❌ createMachine - données manquantes', () => {
    const req = { body: { nameMachine: 'Machine B' } };
    const res = mockResponse();

    machinesController.createMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'nameMachine, statut, and levelAccess are required'
    });
  });

  // READ MACHINE
  test('✅ getMachine - retourne la machine demandée', () => {
    const reqCreate = { body: { nameMachine: 'Machine C', statut: 'active', levelAccess: 1 } };
    const resCreate = mockResponse();
    machinesController.createMachine(reqCreate, resCreate);
    const machineId = resCreate.json.mock.calls[0][0].id;

    const req = { params: { id: machineId.toString() } };
    const res = mockResponse();

    machinesController.getMachine(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: machineId }));
  });

  test('❌ getMachine - machine inexistante', () => {
    const req = { params: { id: '999' } };
    const res = mockResponse();

    machinesController.getMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Machine not found' });
  });

  // UPDATE MACHINE
  test('✅ updateMachine - met à jour une machine', () => {
    const reqCreate = { body: { nameMachine: 'Machine D', statut: 'inactive', levelAccess: 1 } };
    const resCreate = mockResponse();
    machinesController.createMachine(reqCreate, resCreate);
    const machineId = resCreate.json.mock.calls[0][0].id;

    const req = {
      params: { id: machineId.toString() },
      body: { statut: 'active' }
    };
    const res = mockResponse();

    machinesController.updateMachine(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ statut: 'active' }));
  });

  test('❌ updateMachine - machine non trouvée', () => {
    const req = { params: { id: '999' }, body: { statut: 'active' } };
    const res = mockResponse();

    machinesController.updateMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Machine not found' });
  });

  // DELETE MACHINE
  test('✅ deleteMachine - supprime une machine', () => {
    const reqCreate = { body: { nameMachine: 'Machine E', statut: 'active', levelAccess: 1 } };
    const resCreate = mockResponse();
    machinesController.createMachine(reqCreate, resCreate);
    const machineId = resCreate.json.mock.calls[0][0].id;

    const req = { params: { id: machineId.toString() } };
    const res = mockResponse();

    machinesController.deleteMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  // ACCESS MACHINE
  test('✅ accessMachine - accès autorisé', () => {
    const reqCreate = { body: { nameMachine: 'Machine F', statut: 'active', levelAccess: 2 } };
    const resCreate = mockResponse();
    machinesController.createMachine(reqCreate, resCreate);
    const machineId = resCreate.json.mock.calls[0][0].id;

    const req = {
      params: { id: machineId.toString() },
      body: { levelAccessUser: 3 }
    };
    const res = mockResponse();

    machinesController.accessMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      allowed: true,
      message: 'Access granted'
    });
  });

  test('❌ accessMachine - accès refusé', () => {
    const reqCreate = { body: { nameMachine: 'Machine G', statut: 'active', levelAccess: 5 } };
    const resCreate = mockResponse();
    machinesController.createMachine(reqCreate, resCreate);
    const machineId = resCreate.json.mock.calls[0][0].id;

    const req = {
      params: { id: machineId.toString() },
      body: { levelAccessUser: 2 }
    };
    const res = mockResponse();

    machinesController.accessMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      allowed: false,
      message: 'Access denied'
    });
  });

  test('❌ accessMachine - levelAccessUser manquant', () => {
    const reqCreate = { body: { nameMachine: 'Machine H', statut: 'active', levelAccess: 1 } };
    const resCreate = mockResponse();
    machinesController.createMachine(reqCreate, resCreate);
    const machineId = resCreate.json.mock.calls[0][0].id;

    const req = { params: { id: machineId.toString() }, body: {} };
    const res = mockResponse();

    machinesController.accessMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'levelAccessUser required in body'
    });
  });

  test('❌ accessMachine - machine non trouvée', () => {
    const req = { params: { id: '999' }, body: { levelAccessUser: 3 } };
    const res = mockResponse();

    machinesController.accessMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Machine not found' });
  });

});
