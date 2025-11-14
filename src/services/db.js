// ============================
// 🔹 db.js — Gestion de la base
// ============================

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/db.json");

// Base en mémoire utilisée uniquement en mode test
let memoryDB = null;

// Fonction : charger base
function loadDB() {
  // En mode test → base 100% en mémoire
  if (process.env.NODE_ENV === "test") {
    if (!memoryDB) {
      memoryDB = { users: [], machines: [] }; // structure exacte de ta DB
    }
    return memoryDB;
  }

  // En mode normal
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ users: [], machines: [] }, null, 2));
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Fonction : sauvegarder base
function saveDB(db) {
  // En mode test → ne JAMAIS toucher db.json
  if (process.env.NODE_ENV === "test") {
    memoryDB = db;
    return;
  }

  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
}

module.exports = { loadDB, saveDB };
