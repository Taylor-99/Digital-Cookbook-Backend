const client = require('../db');

// Create instructions
const createInstruction = async (client, recipe_id, step, position) => {
  const result = await client.query(
    `INSERT INTO instructions (recipe_id, step, position)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [recipe_id, step, position]
  );

  return result.rows[0];
};

// Get instructions by recipe
const getRecipeInstructions = async (recipeId) => {
  const result = await client.query(
    `SELECT * FROM instructions WHERE recipe_id = $1`,
    [recipeId]
  );

  return result.rows;
};

module.exports = {
  createInstruction,
  getRecipeInstructions,
};