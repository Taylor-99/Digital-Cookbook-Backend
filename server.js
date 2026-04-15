//Dependencies
const express = require('express');
const pool = require('./db');

const PORT = process.env.PORT||4000;

const app = express();
app.use(express.json());


// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).send('Database error');
  }
});


// App Listen
app.listen(PORT, ()=> {
    console.log(`Listening to port ${PORT}`);
  }); 