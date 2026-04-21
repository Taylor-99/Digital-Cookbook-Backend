// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');

const verifyToken = require('../middleware/VerifyJWT');

router.get('/', verifyToken, async (req, res) => {

    try {
        
        
    } catch (error) {
        
    }

});

router.post('/create', verifyToken, async (req, res) => {

  const { title, ingredients, instructions } = req.body;
  const userID = req.user.user_id;

  const client = await pool.connect();

  try {

    await client.query('BEGIN'); //start transaction

    // 1. Create recipe
    const recipe = await db.Recipe.createRecipe(
      userID,
      title,
      null
    );

    const recipeId = recipe.recipe_id;

    // 2. Insert ingredients
    for (let i = 0; i < ingredients.length; i++) {
      await db.Ingredient.createIngredient(
        recipeID,
        ingredients[i].name,
        ingredients[i].quantity,
        i
      );
    };

    // 3. Insert instructions
    for (let i = 0; i < instructions.length; i++) {
      await db.Instruction.createInstruction(
        recipeID,
        instructions[i].step,
        i
      );
    };

    await client.query('COMMIT'); //success

    res.status(201).json({
        message: 'Recipe created successfully',
        recipeID,
    });

    res.json({ message: 'Recipe created' });

  } catch (err) {
    await client.quert('ROLLBACK'); //undo everything if error
    console.error(err);
    res.status(500).json({ error: 'Error creating recipe' });
  } finally {
    client.release();
  }
  
});