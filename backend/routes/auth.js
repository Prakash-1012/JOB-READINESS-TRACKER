const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersPath = path.join(__dirname, '..', 'models', 'users.json');

function readUsers(){
  try { return JSON.parse(fs.readFileSync(usersPath)); }
  catch(e){ return []; }
}
function writeUsers(u){
  fs.writeFileSync(usersPath, JSON.stringify(u, null, 2));
}

// Register: expects { name, age, gender, email, username, password }
router.post('/register', (req, res) => {
  const { name, age, gender, email, username, password } = req.body;
  if (!name || !username || !password || !email) return res.status(400).json({ error: 'name, email, username and password are required' });
  const users = readUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'username already exists' });
  const user = { id: Date.now().toString(36), name, age, gender, email, username, password };
  users.push(user);
  writeUsers(users);
  const safe = { id: user.id, name: user.name, age: user.age, gender: user.gender, email: user.email, username: user.username };
  res.json({ message: 'registered', user: safe });
});

// Login: expects { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const safe = { id: user.id, name: user.name, age: user.age, gender: user.gender, email: user.email, username: user.username };
  res.json({ message: 'ok', user: safe });
});

// Get user by username (safe)
router.get('/user/:username', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'not found' });
  const safe = { id: user.id, name: user.name, age: user.age, gender: user.gender, email: user.email, username: user.username };
  res.json({ user: safe });
});

module.exports = router;
