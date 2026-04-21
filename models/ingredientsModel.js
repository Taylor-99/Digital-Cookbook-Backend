const pool = require('../db');

// Create ingredients
const createIngredient = async (recipe_id, name, quantity, position) => {
  const result = await pool.query(
    `INSERT INTO ingredients (recipe_id, name, quantity, position)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [recipe_id, name, quantity, position]
  );

  return result.rows[0];
};

// Get ingredients by recipe
const getRecipeIngredients = async (recipeId) => {
  const result = await pool.query(
    `SELECT * FROM ingredients WHERE recipe_id = $1`,
    [recipeId]
  );

  return result.rows;
};

module.exports = {
  createIngredient,
  getRecipeIngredients,
};