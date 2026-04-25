const client = require('../db');

// Create instructions
const createInstruction = async (client, recipe_id, step, position) => {
  const result = await client.query(
    `INSERT INTO instructions (recipe_id, step, position)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [recipe_id, step, position]
  );

  console.log("INSTRUCTIONS: ",result.rows[0])

  return result.rows[0];
};

// Get instructions by recipe
const getRecipeInstructions = async (client, recipe_id) => {
  const result = await client.query(
    `SELECT * FROM instructions WHERE recipe_id = $1`,
    [recipe_id]
  );

  return result.rows;
};

const deleteInstructionsByRecipeId = async (client, recipe_id) => {
  const result = await client.query(
    `DELETE FROM instructions
    WHERE recipe_id = $1`,
    [recipe_id]
  );

  return result.rowCount;
};

module.exports = {
  createInstruction,
  getRecipeInstructions,
  deleteInstructionsByRecipeId
};