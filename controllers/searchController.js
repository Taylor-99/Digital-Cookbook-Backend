// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const pool = require('../db');

const verifyToken = require('../middleware/VerifyJWT');

router.get('/', async (req, res) => {

    try {

        const randomRecipes = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${process.env.SPOONACULAR_API_KEY}`);

        if (!randomRecipes.ok) {
            throw new Error(`API Error: ${randomRecipes.status}`);
        }

        const data = await randomRecipes.json();
        res.status(200).json(data);
        
        
    } catch (error) {

        console.error("Error getting Recipes:", error.message);
        res.status(500).json({ message: 'Internal server error' });
        
    }

});

module.exports = router