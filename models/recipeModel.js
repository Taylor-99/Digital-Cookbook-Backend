const pool = require('../db');

// Create recipe
const createRecipe = async (
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
  const result = await pool.query(
    `INSERT INTO recipes
     (user_id, title, image, cook_time, prep_time, serving_size, description, source, spoonacular_id)

     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)

     ON CONFLICT (user_id, spoonacular_id)
     DO NOTHING
     
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

const getSavedRecipe = async (
    userID,
    spoonacularID
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM recipes
        WHERE user_id = $1
        AND spoonacular_id = $2
        `,
        [userID, spoonacularID]
    );

    return result.rows[0];
};

const updateRecipe = async (
  recipe_id,
  user_id,
  title,
  image,
  cook_time,
  prep_time,
  serving_size,
  description,
  source,
  spoonacular_id) => {

    const result = await pool.query(
      `UPDATE recipes 
       SET 
        title = $1,
        image = $2,
        cook_time = $3,
        prep_time = $4,
        serving_size = $5,
        description = $6,
        source = $7,
        spoonacular_id = $8, 
        updated_at = NOW()
       WHERE recipe_id = $9 AND user_id = $10
       RETURNING *`,
      [
        title,
        image,
        cook_time,
        prep_time,
        serving_size,
        description,
        source,
        spoonacular_id,
        recipe_id,
        user_id
      ]
    );

    return result.rows[0];

};

const deleteRecipe = async (recipe_id, user_id) => {

  const result = await pool.query(
      `DELETE FROM recipes 
      WHERE recipe_id = $1 AND user_id = $2
      RETURNING *`,
      [recipe_id, user_id]
  );

  return result.rows[0];

};

module.exports = {
  createRecipe,
  getUserRecipes,
  getRecipeById,
  getSavedRecipe,
  updateRecipe,
  deleteRecipe,
};