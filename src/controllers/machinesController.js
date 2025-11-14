// ======================================================
// 🟦 STOCKAGE EN MEMOIRE
// ======================================================
let machines = [];          // tableau des machines
let nextId = 1;             // ID auto-incrémenté

// ======================================================
// 🟩 UTILITAIRES
// ======================================================
function findMachineById(id) {
  return machines.find(m => m.id === parseInt(id));
}

// ======================================================
// 🟨 CREATE MACHINE
// ======================================================
exports.createMachine = (req, res) => {
  const { nameMachine, statut, levelAccess } = req.body;

  if (!nameMachine || !statut || levelAccess == null) {
    return res.status(400).json({ error: 'nameMachine, statut, and levelAccess are required' });
  }

  const newMachine = {
    id: nextId++,
    nameMachine,
    statut,
    levelAccess
  };

  machines.push(newMachine);

  return res.status(201)
    .location(`/v1/machines/${newMachine.id}`)
    .json(newMachine);
};

// ======================================================
// 🟧 READ MACHINE
// ======================================================
exports.getMachine = (req, res) => {
  const machine = findMachineById(req.params.id);

  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  return res.json(machine);
};

// ======================================================
// 🟪 UPDATE MACHINE
// ======================================================
exports.updateMachine = (req, res) => {
  const machine = findMachineById(req.params.id);

  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  Object.assign(machine, req.body);

  return res.json(machine);
};

// ======================================================
// 🟥 DELETE MACHINE
// ======================================================
exports.deleteMachine = (req, res) => {
  const id = parseInt(req.params.id);
  const machine = findMachineById(id);

  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  machines = machines.filter(m => m.id !== id);

  return res.status(204).end();
};

// ======================================================
// 🟦 ACCESS MACHINE
// ======================================================
exports.accessMachine = (req, res) => {
  const machine = findMachineById(req.params.id);

  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  const { levelAccessUser } = req.body;

  if (levelAccessUser == null) {
    return res.status(400).json({ error: 'levelAccessUser required in body' });
  }

  const allowed = levelAccessUser >= machine.levelAccess;

  if (!allowed) return res.status(403).json({ allowed: false, message: 'Access denied' });

  return res.status(200).json({ allowed: true, message: 'Access granted' });
};
