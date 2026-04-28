const pool = require('../db');

// Create instructions
const createInstruction = async (recipe_id, step, position) => {
  const result = await pool.query(
    `INSERT INTO instructions (recipe_id, step, position)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [recipe_id, step, position]
  );

  // console.log("INSTRUCTIONS: ",result.rows[0])

  return result.rows[0];
};

// Get instructions by recipe
const getRecipeInstructions = async (recipe_id) => {
  const result = await pool.query(
    `SELECT * FROM instructions WHERE recipe_id = $1`,
    [recipe_id]
  );

  return result.rows;
};

const deleteInstructionsByRecipeId = async (recipe_id) => {
  const result = await pool.query(
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