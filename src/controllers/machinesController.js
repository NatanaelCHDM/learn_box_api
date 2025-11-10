// Tableau temporaire pour stocker les machines (en mémoire, sans base de données)
let machines = [];

// Compteur auto-incrémenté pour attribuer un ID unique à chaque machine
let nextId = 1;

// ========================
// CREATE MACHINE
// ========================
exports.createMachine = (req, res) => {
  // Extraction des propriétés envoyées dans le corps de la requête
  const { nameMachine, statut, levelAccess } = req.body;

  // Vérifie que toutes les données obligatoires sont présentes
  if (!nameMachine || !statut || !levelAccess) {
    return res.status(400).json({ error: 'nameMachine, statut, and levelAccess are required' });
  }

  // Crée une nouvelle machine avec un ID unique
  const newMachine = { id: nextId++, nameMachine, statut, levelAccess };

  // Ajoute la machine dans le tableau "machines"
  machines.push(newMachine);

  // Retourne une réponse HTTP 201 (créé) avec la ressource nouvellement créée
  res.status(201)
    .location(`/v1/machines/${newMachine.id}`)  // indique l’URL de la ressource
    .json(newMachine); // renvoie la machine créée au format JSON
};

// ========================
// READ MACHINE
// ========================
exports.getMachine = (req, res) => {
  // Recherche une machine dont l'ID correspond au paramètre d'URL
  const machine = machines.find(m => m.id === parseInt(req.params.id));

  // Si aucune machine n’est trouvée, retourne une erreur 404
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  // Sinon, renvoie la machine au format JSON
  res.json(machine);
};

// ========================
// UPDATE MACHINE
// ========================
exports.updateMachine = (req, res) => {
  // Recherche la machine à mettre à jour
  const machine = machines.find(m => m.id === parseInt(req.params.id));

  // Si non trouvée → 404
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  // Met à jour les propriétés de la machine avec celles envoyées dans la requête
  Object.assign(machine, req.body);

  // Renvoie la machine mise à jour
  res.json(machine);
};

// ========================
// DELETE MACHINE
// ========================
exports.deleteMachine = (req, res) => {
  // Supprime la machine du tableau via un filtre
  machines = machines.filter(m => m.id !== parseInt(req.params.id));

  // Envoie une réponse 204 (No Content) → suppression réussie sans contenu à renvoyer
  res.status(204).end();
};

// ========================
// ACCESS MACHINE
// ========================
// Vérifie si un utilisateur peut accéder à une machine selon son niveau d’accès
exports.accessMachine = (req, res) => {
  // Recherche de la machine concernée
  const machine = machines.find(m => m.id === parseInt(req.params.id));

  // Si la machine n’existe pas → erreur 404
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  // Extraction du niveau d’accès de l’utilisateur depuis le corps de la requête
  const { levelAccessUser } = req.body;

  // Si ce champ n’est pas fourni → erreur 400
  if (!levelAccessUser) {
    return res.status(400).json({ error: 'levelAccessUser required in body' });
  }

  // Vérifie si le niveau d’accès de l’utilisateur est suffisant
  const allowed = levelAccessUser >= machine.levelAccess;

  // Si accès refusé → 403
  if (!allowed) return res.status(403).json({ allowed: false, message: 'Access denied' });

  // Sinon, autorisation accordée → 200
  res.status(200).json({ allowed: true, message: 'Access granted' });
};