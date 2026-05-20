// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const pool = require('../db');

const verifyToken = require('../middleware/VerifyJWT');

router.get('/', verifyToken, async (req, res) => {
    const userID = req.user.user_id;

    // console.log("in backend")

    try {

        const userCollections = await db.Collection.getUserCollections(userID);

        res.send(userCollections);

    } catch (error) {
        console.error("Error getting collections: ", error.message);
        res.status(500).json({message: 'Internal server error'}); 
    }
});

router.get('/collection/:collectionid', verifyToken, async (req, res) => {
    
    const { collectionid } = req.params;
    const userID = req.user.user_id;

    const userOwns = await db.Collection.ownsCollection(collectionid, userID);

    if (!userOwns){
        return res.status(403).jason({message: "unauthorized"});
    };

    try {

        const collection = await db.Collection.getCollectionById(collectionid, userID);

        if(!collection) {
            return res.status(404).json({message: 'Collection not found'});
        }

        const collectionRecipes = await db.Collection.getCollectionRecipes(collectionid);

        const fullCollection = {
            ...collection,
            recipes: collectionRecipes
        };

        res.json(fullCollection);

    }catch (error){

        console.error("Error getting collection: ", error.message);
        res.status(500).json({message: 'server error'});

    };
    
});

router.get("/collectionsrecipe/:recipeId", verifyToken, async(req, res) => {
    const { recipeId } = req.params;
    const userID = req.user.user_id;

    try{

        const collectionRecipe = await db.Collection.getCollectionRecipe(recipeId, userID);

        res.status(200).json(collectionRecipe);

    } catch (error){

        console.error("Error getting recipe: ", error.message);
        res.status(500).json({message: 'server error'});

    };


});

router.delete('/collection/:collectionid', verifyToken, async (req, res) => {

    const { collectionid } = req.params;
    const userID = req.user.user_id;

    try{
        const deletedCollection = db.Collection.deleteCollection(collectionid, userID);

        if (deletedCollection === 0){
            return res.status(404).json({message: 'Collection not found or unauthorized'});
        }

        return res.json({message: 'Collection deleted successfully'});

    }catch (error) {
        console.error(error);
        res.status(500).json({error: 'ERROR deleting collection'});
    };
});

router.delete('/:collectionid/recipe/:recipeid', verifyToken, async (req, res) => {

    const { collectionid, recipeid } = req.params;
    const userID = req.user.user_id;

    try{

        const userOwns = await db.Collection.ownsCollection(collectionid, userID);

        if(!userOwns) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        };

        const removedRecipe = await db.Collection.removeRecipeFromCollection(collectionid, recipeid);

        if(removedRecipe === 0){
            return res.status(404).json({
                message: 'Recipe not found or unauthorized'
            });
        };

        return res.json({message: 'Recipe removed from collection successfully'});

    }catch (error){
        console.error(error);
        res.status(500).json({error: 'ERROR removing recipe'});
    };

});

router.put('/:collectionid', verifyToken, async (req, res) => {
  const { collectionid } = req.params;
  const userID = req.user.user_id;

  const { collection_name, description} = req.body;

  try {

    const updatedCollection= await db.Collection.updateCollection(
        collection_name,
        description,
        collectionid,
        userID
    );

    if (updatedCollection === 0) {
      return res.status(404).json({ message: 'Collection not found or unauthorized' });
    };

    res.json(updatedCollection);

  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ message: 'Error updating collection' });
  };

});

router.post('/create', verifyToken, async (req, res) => {

    const { collection_name, description} = req.body;
    const userID = req.user.user_id;

  try {

    const newCollection = await db.Collection.createCollection(
        userID,
        collection_name,
        description
    );

    // res.status(201).json({
    //     message: "Collection created successfully"
    // });

    return res.json(newCollection);

  } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating collection' });
  };

});

router.post('/:id/recipe', verifyToken, async (req, res) => {
    
    const collectionID = req.params.id;
    const { recipe_id } = req.body;
    const userID = req.user.user_id;

    try {

        const userOwns = await db.Collection.ownsCollection(collectionID, userID);

        if(!userOwns) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        };

        await db.Collection.addRecipeToCollection(
            collectionID,
            recipe_id
        );

        return res.status(201).json({
            message: " Recipe added to collection"
        })

    }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
})

module.exports = router