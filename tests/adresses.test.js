const request = require('supertest');
const express = require('express');
const adressesRouter = require('../src/routes/adresses');

// Création d'une app Express test
const app = express();
app.use('/v1/adresses', adressesRouter);

// Test principal : endpoint GET /v1/adresses
describe('GET /v1/adresses', () => {
  it('devrait retourner 400 si q est manquant', async () => {
    const res = await request(app).get('/v1/adresses');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Paramètre "q" manquant');
  });

  it('devrait retourner un tableau d’adresses pour une recherche valide', async () => {
    const res = await request(app).get('/v1/adresses').query({ q: '10 rue de Paris' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('geometry');
      expect(res.body[0]).toHaveProperty('properties');
      expect(res.body[0].properties).toHaveProperty('label');
    }
  });
});
