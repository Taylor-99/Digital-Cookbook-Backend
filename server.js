//Dependencies
const express = require('express');
const pool = require('./db');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const morgan = require('morgan')
const cors = require("cors");

userCtrl = require('./controllers/userController');
recipeCtrl = require('./controllers/recipeController');
collectionCtrl = require('./controllers/collectionsController');

const PORT = process.env.PORT||4000;

const app = express();

const liveReloadServer = livereload.createServer();

liveReloadServer.server.once("connection", () => {
    // wait for nodemon to fully restart before refreshing the page
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

// Indicates where our static files are located
app.use(
    cors({
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Use the connect-livereload package to connect nodemon and livereload
app.use(connectLiveReload());
// Body parser: used for POST/PUT/PATCH routes: 
// this will take incoming strings from the body that are URL encoded and parse them 
// into an object that can be accessed in the request parameter as a property called body (req.body).

app.use(morgan('tiny')); // morgan is just a logger

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).send('Database error');
  }
});

app.use('/auth', userCtrl);
app.use('/recipe', recipeCtrl);
app.use('./collection', collectionCtrl);


// App Listen
app.listen(PORT, ()=> {
    console.log(`Listening to port ${PORT}`);
  }); 