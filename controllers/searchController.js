// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const pool = require('../db');

const verifyToken = require('../middleware/VerifyJWT');

let randomRecipesCache = null;
let randomRecipesCacheTime = null;

router.get('/', async (req, res) => {

    try {

        const ONE_HOUR = 60 * 60 * 1000;
    
        if (
          randomRecipesCache &&
          randomRecipesCacheTime &&
          Date.now() - randomRecipesCacheTime < ONE_HOUR
        ) {
          return res.json(randomRecipesCache);
        }

        const randomRecipes = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${process.env.SPOONACULAR_API_KEY}`);

        if (!randomRecipes.ok) {
            const errorData = await randomRecipes.json();

            return res.status(randomRecipes.status).json({
                message:
                errorData.message ||
                "Unable to retrieve recipes"
            });
        }

        const data = await randomRecipes.json();

        randomRecipesCache = data.recipes;
        randomRecipesCacheTime = Date.now();

        // console.log(randomRecipesCache)

        return res.json(randomRecipesCache);
        
        
    } catch (error) {

        console.error("Error getting Recipes:", error.message);
        res.status(500).json({ message: 'Internal server error' });
        
    }

});

const recipeCache = {};

router.get('/:recipeid', async (req, res) => {
    try{

        const { recipeid } = req.params;

        const ONE_HOUR = 60 * 60 * 1000;

        const cachedRecipe = recipeCache.get(recipeid);

        if (
        cachedRecipe &&
        Date.now() - cachedRecipe.timestamp < ONE_HOUR
        ) {
        return res.json(cachedRecipe.data);
        }

        const selectedRecipeResponse = await fetch(`https://api.spoonacular.com/recipes/${recipeid}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`);
        const selectedRecipe = await selectedRecipeResponse.json();

        const similarRecipesResponse = await fetch(`https://api.spoonacular.com/recipes/${recipeid}/similar?apiKey=${process.env.SPOONACULAR_API_KEY}`);
        const similarRecipes = await similarRecipesResponse.json();

        const recipePackage = await {
            recipe: selectedRecipe,
            similarRecipes: similarRecipes,
        };

        recipeCache.set(recipeid, {
            data: recipePackage,
            timestamp: Date.now()
        });

        res.status(200).json(recipePackage);

    }catch (error) {

        console.error("Error getting Recipes:", error.message);
        res.status(500).json({ message: 'Internal server error' });

    }
});

//check to see if the recipe is saved to the users recipes
router.get('/:recipeid/saved', verifyToken, async (req, res) => {

    const { recipeid } = req.params;

    const userID = req.user.user_id;

    try {

        const savedRecipe =
            await db.Recipe.getSavedRecipe(
                userID,
                recipeid
            );

        res.status(200).json({
            saved: !!savedRecipe,
            recipeID: savedRecipe?.recipe_id || null
        });

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            message: 'Internal server error'
        });

    }

});

router.post('/searchquery', async (req, res) => {

    try{

        // console.log(req.body);

        const {
            query, //String
            diet, //String
            cuisine, //String
            includeIngredients, //Array of Strings
            excludeIngredients, //Array of Strings
            maxReadyTime //Number
        } = req.body;

        const params = new URLSearchParams();

        if (query) {
            params.append('query', query);
        };

        if (diet) {
            params.append('diet', diet);
        };

        if (cuisine) {
            params.append('cuisine', cuisine);
        };

        if (maxReadyTime) {
            params.append('maxReadyTime', maxReadyTime);
        };

        if (includeIngredients?.length) {
            params.append(
                'includeIngredients',
                includeIngredients.join(',')
            );
        };

        if (excludeIngredients?.length) {
            params.append(
                'excludeIngredients',
                excludeIngredients.join(',')
            );
        };

        params.append('instructionsRequired', true);
        params.append('addRecipeInformation', true);
        params.append('number', 12);

        params.append(
            'apiKey',
            process.env.SPOONACULAR_API_KEY
        );

        const searchResponse = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?${params}`
        );

        if (!searchResponse.ok) {
            throw new Error(
                `API Error: ${searchResponse.status}`
            );
        }

        const data = await searchResponse.json();

        // console.log(params.toString());

        if (data.results.length === 0) {
            return res.status(200).json({
                message: 'No recipes found',
                results: []
            });
        }else{
            res.status(200).json(data);
        }

    }catch (error) {

        console.error(
            "Error searching recipes:",
            error.message
        );

        res.status(500).json({
            message: 'Internal server error'
        });

    };

});

router.post('/save', verifyToken, async(req, res) => {

    const { title, image, cook_time, prep_time, serving_size, description, spoonacular_id} = req.body;
    const userID = req.user.user_id;
    const source = 'api';

    try{

        const recipe = await db.Recipe.createRecipe(
                userID,
                title,
                image,
                cook_time,
                prep_time,
                serving_size,
                description,
                source,
                spoonacular_id
        );

        console.log(recipe);

        return res.status(201).json({
            message: 'Recipe created successfully',
            recipeid: recipe.recipe_id
        });

    }catch (error) {

        console.error(error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });

    }
});

module.exports = router