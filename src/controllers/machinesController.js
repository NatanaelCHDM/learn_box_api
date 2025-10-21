let machines = []; // stockage temporaire
let nextId = 1;

exports.createMachine = (req, res) => {
  const { nameMachine, statut, levelAccess } = req.body;

  if (!nameMachine || !statut || !levelAccess) {
    return res.status(400).json({ error: 'nameMachine, statut, and levelAccess are required' });
  }

  const newMachine = { id: nextId++, nameMachine, statut, levelAccess };
  machines.push(newMachine);

  res.status(201)
    .location(`/v1/machines/${newMachine.id}`)
    .json(newMachine);
};

exports.getMachine = (req, res) => {
  const machine = machines.find(m => m.id === parseInt(req.params.id));
  if (!machine) return res.status(404).json({ error: 'Machine not found' });
  res.json(machine);
};

exports.updateMachine = (req, res) => {
  const machine = machines.find(m => m.id === parseInt(req.params.id));
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  Object.assign(machine, req.body);
  res.json(machine);
};

exports.deleteMachine = (req, res) => {
  machines = machines.filter(m => m.id !== parseInt(req.params.id));
  res.status(204).end();
};

// Vérifie si un utilisateur peut accéder à une machine
exports.accessMachine = (req, res) => {
  const machine = machines.find(m => m.id === parseInt(req.params.id));
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  // Exemple simplifié : on attend que le user.levelAccess soit envoyé dans le corps
  const { levelAccessUser } = req.body;

  if (!levelAccessUser) {
    return res.status(400).json({ error: 'levelAccessUser required in body' });
  }

  const allowed = levelAccessUser >= machine.levelAccess;
  if (!allowed) return res.status(403).json({ allowed: false, message: 'Access denied' });

  res.status(200).json({ allowed: true, message: 'Access granted' });
};
