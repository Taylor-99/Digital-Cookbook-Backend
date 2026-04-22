// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const pool = require('../db');

const verifyToken = require('../middleware/VerifyJWT');

//gets all the recipes the user created and saved
router.get('/', verifyToken, async (req, res) => {

    const userID = req.user.user_id;

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const userRecipes = await db.Recipe.getUserRecipes(userID);

        res.send(userRecipes);
        
        
    } catch (error) {

        console.error("Error getting Recipes:", error.message);
        res.status(500).json({ message: 'Internal server error' });
        
    }

});

//gets one the recipe with ingredients and instructions
// used for viewing and editing
router.get('/:id', verifyToken, async (req, res) => {

    const recipeID = req.params.id;
    const userID = req.user.user_id;

    try {

        const recipe = await db.Recipe.getRecipeById(recipeID, userID);

        if (!recipe){
            return res.status(404).json({message: 'Recipe not found'});
        }

        const recipeIngredients = await db.Ingredient.getRecipeIngredients(recipeID);
        const recipeInstructions = await db.Instruction.getRecipeInstructions(recipeID);

        const fullRecipe = {
            ...recipe,
            ingredients: recipeIngredients,
            instructions: recipeInstructions
        }

        res.send(fullRecipe);
        
        
    } catch (error) {

        console.error("Error getting Recipe:", error.message);
        res.status(500).json({ message: 'Internal server error' });
        
    }

});

router.delete('/:id', async (req, res) => {

    //has FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE for instructions and ingredients Tables, so when the recipe is deleted, it will delete both instructions and ingredients automatically.

    const recipeID = req.params.id;
    const userID = req.user.user_id;

    try{
        const result = await pool.query(
            `DELETE FROM recipes 
            WHERE recipe_id = $1 AND user_id = $2
            RETURNING *`,
            [recipeID, userID]
        );

        if (result.rows.length === 0){
            return res.status(404).json({message: 'Recipe not found or unauthorized'});
        }

        res.json({message: 'Recipe deleted successfilly'});
    }catch (err) {
        console.error(err);
        res.status(500).json({error: 'ERROR deleting recipe'})
    }
});

router.put('/:id', verifyToken, async (req, res) => {
  const recipeID = req.params.id;
  const userID = req.user.user_id;

  const { title, ingredients, instructions } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update recipe (and check ownership)
    const recipeResult = await client.query(
      `UPDATE recipes 
       SET title = $1 
       WHERE recipe_id = $2 AND user_id = $3
       RETURNING *`,
      [title, recipeID, userID]
    );

    if (recipeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }

    // 2. Delete old ingredients
    await client.query(
      `DELETE FROM ingredients WHERE recipe_id = $1`,
      [recipeID]
    );

    // 3. Insert new ingredients
    for (let i = 0; i < ingredients.length; i++) {
      await client.query(
        `INSERT INTO ingredients (recipe_id, name, quantity, position)
         VALUES ($1, $2, $3, $4)`,
        [recipeID, ingredients[i].name, ingredients[i].quantity, i]
      );
    }

    // 4. Delete old instructions
    await client.query(
      `DELETE FROM instructions WHERE recipe_id = $1`,
      [recipeID]
    );

    // 5. Insert new instructions
    for (let i = 0; i < instructions.length; i++) {
      await client.query(
        `INSERT INTO instructions (recipe_id, step, position)
         VALUES ($1, $2, $3)`,
        [recipeID, instructions[i].step, i]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Recipe updated successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Error updating recipe' });
  } finally {
    client.release();
  }
});

router.post('/create', verifyToken, async (req, res) => {

    const { title, image, cook_time, prep_time, serving_size, description, source, spoonacular_id, ingredients, instructions } = req.body;
    const userID = req.user.user_id;

    const client = await pool.connect();

    const spoonacularId = spoonacular_id !== undefined && spoonacular_id !== ""
        ? Number(spoonacular_id)
        : null;

    console.log([
        userID,
        title,
        image,
        cook_time,
        prep_time,
        serving_size,
        description,
        source,
        spoonacularId
    ])

  try {

    await client.query('BEGIN'); //start transaction

    // 1. Create recipe
    const recipe = await db.Recipe.createRecipe(
        client,
        userID,
        title,
        image,
        cook_time,
        prep_time,
        serving_size,
        description,
        source,
        spoonacularId
    );

    const recipeId = recipe.recipe_id;

    console.log("RECIPE RESULT: ", recipe)
    console.log("Ingredients: ", ingredients)
    console.log("instructions RESULT: ", instructions)

    
    if(source === 'user'){
        
        // 2. Insert ingredients
        for (let i = 0; i < ingredients.length; i++) {
            console.log(recipeId)
          await db.Ingredient.createIngredient(
            client,
            recipeId,
            ingredients[i].name,
            ingredients[i].quantity,
            i
          );
        };
    
        // 3. Insert instructions
        for (let i = 0; i < instructions.length; i++) {
          await db.Instruction.createInstruction(
            client,
            recipeId,
            instructions[i].step,
            i
          );
        };
    };

    await client.query('COMMIT'); //success

    res.status(201).json({
        message: 'Recipe created successfully',
        recipeId,
    });

    res.json({ message: 'Recipe created' });

  } catch (err) {
        await client.query('ROLLBACK'); //undo everything if error
        console.error(err);
        res.status(500).json({ error: 'Error creating recipe' });
  } finally {
        client.release();
  }

});

module.exports = router