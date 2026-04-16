// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyJWT');

// register route for user registration
router.post('/register', async (req, res, next) => {
    try {
        const { username, firstName, lastName, password } = req.body;

        // Check if the username already exists
        const existingUser = await db.User.findUserByUsername(username);

        if (existingUser) {
            console.log('in back')
            return res.status(400).json({ message: "Username already exists" });
        };

        // Hash the password before saving the user
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    
        const newUser = await db.User.createUser(
            username,
            firstName,
            lastName,
            hashedPassword
        );

        // Create a token for the new user
        const token = createToken(newUser.user_id);
        

        console.log(token)

        // Send cookie
        res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set true in production
        });

        res.status(201).json({
            message: "User signed up successfully",
            success: true,
            token,
            username: newUser.username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating user" });
    }
});

// Login route for user authentication
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if both username and password are provided
        if(!username || !password ){
            return res.json({message:'All fields are required'});

        }

        const user = await db.User.findUserByUsername(username);

            // Check if user exists in the database
        if(!user) {
            // console.log(`Could not find this user in the database: User with username ${userLogin.username}`);
            return res.status(400).json({ message: `Could not find ${username} in the database` });
        }

        // Compare provided password with stored hash
        const auth = await bcrypt.compare(password, user.password_hash);

        if (!auth) {
            return res.status(400).json({ message: `The password did not match the for the user: ${user.username}` });
        }else {
            // make a token
            const token = createToken(user.user_id)

            console.log("token from login route = ", token)

            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // set true in production
            });
            res.status(201).json({
            message: "User signed in successfully",
            success: true,
            token,
            username: user.username
        });
        
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error Logging In" });
    }
});

// Route for token verification
router.get('/', async (req, res) => {
    const token = req.cookies.token

    if (!token) {
        return res.json({ status: false })
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false })
        } else {
            const user = await db.User.findUserByUsername(data.username)

            if (user) return res.json({ status: true, user: user.username })
            else return res.json({ status: false })
        }
  })
})

// Function to create JWT token
function createToken(userID){
    return jwt.sign(
        { userID }, 
        process.env.SECRET, 
        { expiresIn: '24h'} // Token expiration time set to 24 hours
    );
};
 

// Export the router to be used in other parts of the application
module.exports = router