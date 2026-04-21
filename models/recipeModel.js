const pool = require('../db');

// Create recipe
const createRecipe = async (userId, spoonacular_id, title, image, description, cook_time, prep_time, serving_size, source) => {
  const result = await pool.query(
    `INSERT INTO recipes (user_id, title, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, spoonacular_id, title, image, description, cook_time, prep_time, serving_size, source]
  );

  return result.rows[0];
};

// Get recipes by user
const getUserRecipes = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM recipes WHERE user_id = $1`,
    [userId]
  );

  return result.rows;
};

// Get single recipe
const getRecipeById = async (recipeId) => {
  const result = await pool.query(
    `SELECT * FROM recipes WHERE recipe_id = $1`,
    [recipeId]
  );

  return result.rows[0];
};

const saveApiRecipe = async (userId, recipe) => {
  const result = await pool.query(
    `INSERT INTO recipes (user_id, title, image, spoonacular_id, source)
     VALUES ($1, $2, $3, $4, 'api')
     ON CONFLICT (user_id, spoonacular_id) DO NOTHING
     RETURNING *`,
    [userId, recipe.title, recipe.image, recipe.id]
  );

  return result.rows[0];
};

module.exports = {
  createRecipe,
  getUserRecipes,
  getRecipeById,
  saveApiRecipe,
};