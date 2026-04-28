const pool = require('../db');

const createCollection = async (
    user_id,
    collection_name,
    description,
    is_public
) => {
    const result = await pool.query(
        `INSERT INTO collections
        (user_id, collection_name, description, is_public)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            user_id,
            collection_name,
            description,
            is_public
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
    description,
    is_public
) => {
    const result = await pool.query(
        `UPDATE collections
        SET
            collection_name = $1,
            description = $2,
            is_public = $3
        WHERE collection_id = $4 AND user_id = $5
        RETURNING *`,
        [
            collection_id, 
            user_id, 
            collection_name, 
            description,
            is_public
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

const ownsCollection = async = (
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

module.exports = {
    createCollection,
    getUserCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    addRecipeToCollection,
    removeRecipeFromCollection,
    ownsCollection,
}