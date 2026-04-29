// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const pool = require('../db');

const verifyToken = require('../middleware/VerifyJWT');

router.get('/', verifyToken, async (req, res) => {
    const userID = req.user.user_id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userCollections = await db.Collection.getUserCollections(userID);

        res.send(userCollections);

        const
    } catch (error) {
        console.error("Error getting collections: ", error.message);
        res.status(500).json({message: 'Internal server error'}); 
    }
});

router.get('/.id'), verifyToken, async (req, res) => {
    
    const collectionID = req.params.id;
    const userID = req.user.user_id;
    const client = await pool.connect();

    
}

module.exports = router