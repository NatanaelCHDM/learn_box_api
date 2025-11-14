# learn_box_api - Projet FIL ROUGE - Développement API

## Description
API REST pour le projet **LEARN_BOX**, permettant la gestion des utilisateurs et des machines, avec authentification JWT et documentation Swagger.

---

## Installation

1. **Cloner le dépôt :**
```bash
git clone https://github.com/NatanaelCHDM/learn_box_api.git
````

2. **Installer les dépendances :**

```bash
cd learn_box_api
npm install
npm install bcrypt jsonwebtoken dotenv
npm install --save-dev jest supertest
npm install axios
npm install node-cache


```

3. **Créer le fichier `.env` à partir de `.env.example` et renseigner vos secrets :**

```env
PORT=3000
JWT_SECRET=ton_secret_jwt
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
PASSWORD_SALT=10
```

4. **Lancer le serveur en mode développement :**

```bash
npm run start-dev
```

Le serveur est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Documentation Swagger

Swagger permet de consulter et tester les endpoints directement depuis le navigateur :

1. Lancer le serveur.
2. Aller sur [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
3. Toutes les routes sont documentées :

   * `/v1/users` → CRUD utilisateurs
   * `/v1/machines` → CRUD machines + accès utilisateur
   * `/auth` → inscription, login, refresh et logout

> Les endpoints protégés nécessitent le token JWT dans le header `Authorization: Bearer <token>`.

---

## Tests unitaires

Pour exécuter les tests et vérifier la couverture :

```bash
npm test -- --coverage
```

* Le rapport complet se trouve dans `coverage/lcov-report/index.html`.
* Objectif atteint : >80% de couverture sur `usersController.js`.

---

## Scripts npm utiles

```json
"scripts": {
  "start-dev": "node --env-file=.env ./src/index.js",
  "test": "jest"
}
```

* `npm run start-dev` → démarre le serveur avec les variables d’environnement.
* `npm test` → lance les tests unitaires avec Jest.

---

## Étapes Git de base

1. Initialiser le repo local si ce n’est pas déjà fait :

```bash
git init
git add .
git commit -m "Initial commit"
git push
```

2. Pousser vers le dépôt distant :

```bash
git remote add origin <url-du-repo>
git push -u origin main
```


## Licence

Ce projet est distribué sous la licence **MIT**.  
Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
