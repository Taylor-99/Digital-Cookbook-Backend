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

router.get('/:id', verifyToken, async (req, res) => {
    
    const { collectionID } = req.params.id;
    const userID = req.user.user_id;

    const userOwns = await db.Collection.ownsCollection(collectionID, userID);

    if (!userOwns){
        return res.status(403).jason({message: "unauthorized"});
    };

    try {

        const collection = await db.Collection.getCollectionById(collectionID, userID);

        if(!collection) {
            return res.status(404).json({message: 'Collection not found'});
        }

        const collectionRecipes = await db.Collection.getCollectionRecipes(collectionID);

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

router.delete('/:id', verifyToken, async (req, res) => {

    const { collectionID } = req.params.id;
    const userID = req.user.user_id;

    try{
        const deletedCollection = db.Collection.deleteCollection(collectionID, userID);

        if (deletedCollection === 0){
            return res.status(404).json({message: 'Collection not found or unauthorized'});
        }

        return res.json({message: 'Collection deleted successfully'});

    }catch (error) {
        console.error(error);
        res.status(500).json({error: 'ERROR deleting collection'});
    };
});

router.delete('/:id', verifyToken, async (req, res) => {

    const { collectionID } = req.params.id;
    const { recipeID } = req.body;
    const userID = req.user.user_id;

    try{

        const userOwns = await db.Collection.ownsCollection(collectionID, userID);

        if(!userOwns) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        };

        const removedRecipe = db.Collection.removeRecipeFromCollection(collectionID, recipeID);

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

router.put('/:id', verifyToken, async (req, res) => {
  const { collectionID } = req.params.id;
  const userID = req.user.user_id;

  const { collection_name, description} = req.body;

  try {

    const updatedCollection= await db.Collection.updateCollection(
        collectionID,
        userID,
        collection_name,
        description
    );

    if (updatedCollection === 0) {
      return res.status(404).json({ message: 'Collection not found or unauthorized' });
    };

    res.json({ message: 'Collection updated successfully' });

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
    
    const { collectionID } = req.params.id;
    const { recipeID } = req.body;
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
            recipeID
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