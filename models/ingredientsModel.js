const pool = require('../db');

// Create ingredients
const createIngredient = async (recipe_id, name, quantity, unit, position) => {
  const result = await pool.query(
    `INSERT INTO ingredients (recipe_id, name, quantity, unit, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [recipe_id, name, quantity, unit, position]
  );

  console.log("INGREDIENTS: ", result.rows[0])

  return result.rows[0];
};

// Get ingredients by recipe
const getRecipeIngredients = async (recipe_id) => {
  const result = await pool.query(
    `SELECT * FROM ingredients WHERE recipe_id = $1`,
    [recipe_id]
  );

  return result.rows;
};

const deleteIngredientsByRecipeId = async (recipe_id) => {
  const result = await pool.query(
    `DELETE FROM ingredients
    WHERE recipe_id = $1`,
    [recipe_id]
  );

  return result.rowCount;
};

module.exports = {
  createIngredient,
  getRecipeIngredients,
  deleteIngredientsByRecipeId
};