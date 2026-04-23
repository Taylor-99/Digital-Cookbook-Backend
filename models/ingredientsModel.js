const client = require('../db');

// Create ingredients
const createIngredient = async (client, recipe_id, name, quantity, unit, position) => {
  const result = await client.query(
    `INSERT INTO ingredients (recipe_id, name, quantity, unit, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [recipe_id, name, quantity, unit, position]
  );

  console.log("INGREDIENTS: ", result.rows[0])

  return result.rows[0];
};

// Get ingredients by recipe
const getRecipeIngredients = async (recipeId) => {
  const result = await client.query(
    `SELECT * FROM ingredients WHERE recipe_id = $1`,
    [recipeId]
  );

  return result.rows;
};

module.exports = {
  createIngredient,
  getRecipeIngredients,
};