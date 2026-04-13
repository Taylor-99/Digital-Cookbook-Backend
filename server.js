//Dependencies
const express = require('express');
const {Pool, Client} = require("pg");
require('dotenv').config()

const PORT = process.env.PORT||4000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const app = express();

app.use(express.static('public'));
app.use(
  express.urlencoded({
    extended: true,
  })
)


// App Listen
app.listen(PORT, ()=> {
    console.log(`Listening to port ${PORT}`);
  }); 