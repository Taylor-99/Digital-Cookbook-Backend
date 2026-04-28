require('dotenv').config()

module.exports = {
  User: require('./userModel'),
  Recipe: require('./recipeModel'),
  Ingredient: require('./ingredientsModel'),
  Instruction: require('./instructionsModel'),
  Collection: require('./collectionModel')
};