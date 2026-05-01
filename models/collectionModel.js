const pool = require('../db');

const createCollection = async (
    user_id,
    collection_name,
    description
) => {
    const result = await pool.query(
        `INSERT INTO collections
        (user_id, collection_name, description)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [
            user_id,
            collection_name,
            description
        ]
    );

    return result.rows[0];
};

const getUserCollections = async (user_id) => {
    const result = await pool.query(
        `SELECT * FROM collections WHERE user_id = $1`,
        [user_id]
    );

    return result.rows;
};

const getCollectionById = async (collection_id, user_id) => {
    const result = await pool.query(
        `SELECT * FROM collections WHERE collection_id = $1 AND user_id - $2`,
        [collection_id, user_id]
    )
};

const updateCollection = async (
    collection_id,
    user_id,
    collection_name,
    description
) => {
    const result = await pool.query(
        `UPDATE collections
        SET
            collection_name = $1,
            description = $2,
        WHERE collection_id = $4 AND user_id = $5
        RETURNING *`,
        [
            collection_id, 
            user_id, 
            collection_name, 
            description
        ]
    );

    return result.rows[0];
};

const deleteCollection = async (collection_id, user_id) => {
    const result = await pool.query(
        `DELETE FROM collections
        WHERE collection_id = $1 AND user_id = $2
        RETURNING *`,
        [collection_id, user_id]
    );

    return result.rows[0];
};

const ownsCollection = async (
    collection_id,
    user_id
) => {
    const result = await pool.query(
        `SELECT 1 FROM collections 
        WHERE collection_id = $1 AND user_id = $2`,
        [collection_id, user_id]
    );
    return (result.rows.length > 0);
};

const addRecipeToCollection = async (
    collection_id,
    recipe_id
) => {
    const result = await pool.query (
        `INSERT INTO collection_recipes (collection_id, recipe_id)
        VALUES ($1, $2)
        RETURNING *`,
        [collection_id, recipe_id]
    );

    return result.rows[0];
};

const getCollectionRecipes = async (collection_id) => {

    const result = await pool.query(
        `SELECT * FROM collection_recipes
        WHERE collection_id = $1`,
        [collection_id]
    );

    return result.rows;
};

const removeRecipeFromCollection = async (
    collection_id,
    recipe_id
) => {
    const result = await pool.query(
        `DELETE FROM collection_recipes
        WHERE collection_id = $1 AND recipe_id = $2
        RETURNING *`,
        [collection_id, recipe_id]
    );

    return result.rowCount;
};

module.exports = {
    createCollection,
    getUserCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    addRecipeToCollection,
    getCollectionRecipes,
    removeRecipeFromCollection,
    ownsCollection,
}