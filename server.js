const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const db = new sqlite3.Database('./responses.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    answers TEXT
  )`);
});

app.post('/api/submit', (req, res) => {
  const answers = JSON.stringify(req.body.answers);
  db.run(`INSERT INTO survey_responses (answers) VALUES (?)`, [answers], function (err) {
    if (err) return res.status(500).send({ error: 'Failed to save.' });
    res.send({ status: 'ok', id: this.lastID });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
