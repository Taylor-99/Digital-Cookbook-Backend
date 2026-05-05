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

    try {

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

  // console.log("in backend")
  // console.log(req.params.id)

    const recipeID = req.params.id;
    const userID = req.user.user_id;

    // console.log(recipeID)

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

        res.json(fullRecipe);
        
        
    } catch (error) {

        console.error("Error getting Recipe:", error.message);
        res.status(500).json({ message: 'Internal server error' });
        
    }

});

router.delete('/:id', verifyToken, async (req, res) => {

    //has FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE for instructions and ingredients Tables, so when the recipe is deleted, it will delete both instructions and ingredients automatically.

    const { recipeID } = req.params.id;
    const userID = req.user.user_id;

    try{
        const deletedRecipe = db.Recipe.deleteRecipe(recipeID, userID);

        if (deletedRecipe === 0){
            return res.status(404).json({message: 'Recipe not found or unauthorized'});
        }

        return res.json({message: 'Recipe deleted successfully'});
    }catch (err) {
        console.error(err);
        res.status(500).json({error: 'ERROR deleting recipe'})
    }
});

router.put('/:id', verifyToken, async (req, res) => {

  const { recipeID } = req.params.id;
  const userID = req.user.user_id;

  const { title, image, cook_time, prep_time, serving_size, description, source, spoonacular_id, ingredients, instructions } = req.body;

  const spoonacularId = spoonacular_id !== undefined && spoonacular_id !== ""
        ? Number(spoonacular_id)
        : null;

  try {

    // 1. Update recipe (and check ownership)

    const updatedRecipe = await db.Recipe.updateRecipe(
        recipeID,
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

    if (updatedRecipe === 0) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }

    // 2. Delete old ingredients
    const deletedIngredients = await db.Ingredient.deleteIngredientsByRecipeId(client, recipeID);
    console.log("Deleted ingredients: ", deletedIngredients);

    // 3. Insert new ingredients
    for (let rItem = 0; rItem < ingredients.length; rItem++) {
      await db.Ingredient.createIngredient(
        recipeID,
        ingredients[rItem].name,
        ingredients[rItem].quantity,
        ingredients[rItem].unit,
        rItem
      );
    };

    // 4. Delete old instructions
    const deletedInstructions = await db.Instruction.deleteInstructionsByRecipeId(recipeID);
    // console.log("Deleted instructions: ", deletedInstructions);

    // 5. Insert new instructions
    for (let rStep = 0; rStep < instructions.length; rStep++) {
      await db.Instruction.createInstruction(
        recipeID,
        instructions[rStep].step,
        rStep
      );
    };

    res.json({ message: 'Recipe updated successfully' });

  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Error updating recipe' });
  }

});

router.post('/create', verifyToken, async (req, res) => {

    const { title, image, cook_time, prep_time, serving_size, description, source, spoonacular_id, ingredients, instructions } = req.body;
    const userID = req.user.user_id;

    const spoonacularId = spoonacular_id !== undefined && spoonacular_id !== ""
        ? Number(spoonacular_id)
        : null;

  try {

    // 1. Create recipe
    const recipe = await db.Recipe.createRecipe(
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
    // console.log("RECIPE: ", recipe)
    // console.log("INGREDIENTS: ", ingredients)
    // console.log("INSTRUCTIONS: ", instructions)

    const recipeId = recipe.recipe_id;

    // console.log(source)
    
    if(source === 'user'){
        
        // 2. Insert ingredients
        for (let rItem = 0; rItem < ingredients.length; rItem++) {
          await db.Ingredient.createIngredient(
            recipeId,
            ingredients[rItem].name,
            ingredients[rItem].quantity,
            ingredients[rItem].unit,
            rItem
          );
        };
    
        // 3. Insert instructions
        for (let rStep = 0; rStep < instructions.length; rStep++) {
          await db.Instruction.createInstruction(
            recipeId,
            instructions[rStep].step,
            rStep
          );
        };
    };

    return res.status(201).json({
        message: 'Recipe created successfully',
        recipeId,
    });

  } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating recipe' });
  };

});

module.exports = router