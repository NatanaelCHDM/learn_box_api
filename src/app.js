const express = require('express');
const path = require('path');
const app = express();

// ---- MIDDLEWARES ----
app.use(express.json());

// ---- ROUTES API ----
const usersRouter = require('./routes/users');
const machinesRouter = require('./routes/machines');

app.use('/v1/users', usersRouter);
app.use('/v1/machines', machinesRouter);

// ---- SERVEUR INTERFACE WEB (OPTIONNEL) ----
// Sert index.html et autres fichiers statiques dans public/
app.use(express.static(path.join(__dirname, '../public')));

// Route racine qui renvoie index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- MIDDLEWARE NOT FOUND ----
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;




/*
const express = require('express');
const app = express();

// middlewares
app.use(express.json());

// routes
const usersRouter = require('./routes/users');
const machinesRouter = require('./routes/machines');

app.use('/v1/users', usersRouter);
app.use('/v1/machines', machinesRouter);

// gestion des erreurs simples
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;

*/

/*const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Parser JSON pour POST
app.use(express.json());

// ---- ROUTES API ----

// GET /v1/machines : renvoie toutes les machines depuis data.json
app.get('/v1/machines', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data.json')));
  res.json(data.machines || []);
});

// POST /v1/machines : ajoute une machine dans data.json
app.post('/v1/machines', (req, res) => {
  const filePath = path.join(__dirname, '../data.json');
  const data = JSON.parse(fs.readFileSync(filePath));

  // On ajoute la nouvelle machine
  const newMachine = req.body;
  data.machines = data.machines || [];
  data.machines.push(newMachine);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.status(201).json({ message: 'Machine reçue !', data: newMachine });
});

// ---- SERVEUR INTERFACE WEB ----
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- MIDDLEWARE NOT FOUND ----
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;






// app.js
const express = require('express');
const path = require('path');
const app = express();

// Parser JSON pour POST
app.use(express.json());

// ---- ROUTES API ----
app.get('/v1/machines', (req, res) => {
  res.json([{ nameMachine: "titi", statut: "open", levelAccess: "admin" }]);
});

app.post('/v1/machines', (req, res) => {
  console.log(req.body);
  res.status(201).json({ message: 'Machine reçue !', data: req.body });
});

// ---- SERVEUR INTERFACE WEB ----
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- MIDDLEWARE NOT FOUND (après toutes les routes) ----
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
*/






