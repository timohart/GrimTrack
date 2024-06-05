const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3306;

app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from the public directory

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', // your MySQL username
    password: 'Overseer88!', // your MySQL password
    database: 'gametrackingdb'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Player endpoints
app.get('/players', (req, res) => {
    const sql = 'SELECT * FROM Players';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.post('/players', (req, res) => {
    const { f_name, l_name, email, phone_num, starting_ap } = req.body;
    const sql = 'INSERT INTO Players (f_name, l_name, email, phone_num, starting_ap) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [f_name, l_name, email, phone_num, starting_ap], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ player_id: result.insertId });
    });
});

// Character endpoints
app.get('/characters', (req, res) => {
    const sql = 'SELECT * FROM Characters';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.post('/characters', (req, res) => {
    const { player_id, character_name, class_id, race_id, copper, silver, gold } = req.body;
    const sql = 'INSERT INTO Characters (player_id, character_name, class_id, race_id, copper, silver, gold) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [player_id, character_name, class_id, race_id, copper, silver, gold], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ character_id: result.insertId });
    });
});

// Item endpoints
app.get('/items', (req, res) => {
    const sql = 'SELECT * FROM Items';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.post('/items', (req, res) => {
    const { item_name, item_type, rarity } = req.body;
    const sql = 'INSERT INTO Items (item_name, item_type, rarity) VALUES (?, ?, ?)';
    db.query(sql, [item_name, item_type, rarity], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ item_id: result.insertId });
    });
});

// Event endpoints
app.get('/events', (req, res) => {
    const sql = 'SELECT * FROM Events';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.post('/events', (req, res) => {
    const { event_name, event_date, location, ap_reward } = req.body;
    const sql = 'INSERT INTO Events (event_name, event_date, location, ap_reward) VALUES (?, ?, ?, ?)';
    db.query(sql, [event_name, event_date, location, ap_reward], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ event_id: result.insertId });
    });
});

// Event Check-In and Check-Out
app.post('/events/checkin', (req, res) => {
    const { character_id, event_id } = req.body;
    const sql = 'INSERT INTO CharacterEvents (character_id, event_id) VALUES (?, ?)';
    db.query(sql, [character_id, event_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ success: true });
    });
});

app.post('/events/checkout', (req, res) => {
    const { character_id, event_id } = req.body;
    const sql = 'DELETE FROM CharacterEvents WHERE character_id = ? AND event_id = ?';
    db.query(sql, [character_id, event_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ success: true });
    });
});

app.get('/events/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Events WHERE event_id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        res.json(results[0]);
    });
});

app.get('/events/:id/characters', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT Characters.* FROM Characters
        JOIN CharacterEvents ON Characters.character_id = CharacterEvents.character_id
        WHERE CharacterEvents.event_id = ?
    `;
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});