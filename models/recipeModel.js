const pool = require('../db');

// Create recipe
const createRecipe = async (
  client,
  user_id,
  title,
  image,
  cook_time,
  prep_time,
  serving_size,
  description,
  source,
  spoonacular_id
) => {
  const result = await client.query(
    `INSERT INTO recipes
     (user_id, title, image, cook_time, prep_time, serving_size, description, source, spoonacular_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      user_id,
      title,
      image,
      cook_time,
      prep_time,
      serving_size,
      description,
      source,
      spoonacular_id
    ]
  );

  console.log("RECIPE RESULT: ", result.rows[0])
  console.log("RECIPE ID: ", result.rows[0]?.recipe_id)

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
const getRecipeById = async (recipeId, userId) => {
  const result = await pool.query(
    `SELECT * FROM recipes WHERE recipe_id = $1 AND user_id = $2`,
    [recipeId, userId]
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