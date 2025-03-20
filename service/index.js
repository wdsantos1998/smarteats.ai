const cors = require('cors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const app = express();
const authCookieName = 'token';
const { spawn } = require('child_process'); //test

// The service port
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Store users
let users = [];
let meals = [];
let conversations = {}; // test

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Router for service endpoints
const apiRouter = express.Router();

app.use(cors({
  origin: 'https://smarteats-ai.onrender.com',
  credentials: true
}));

app.use('/api', apiRouter);

// ________________________________MIDDLEWARE___________________________________

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};
//________________________________OPEN AI_________________________________

// chatbot
apiRouter.post('/chat', verifyAuth, (req, res) => {
  const userMessage = req.body.message;
  console.log("I am calling the backend");

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Invalid message input" });
  }
  const userId = req.user.email;

  if (!conversations[userId]) {
    conversations[userId] = [
      {
        role: "system",
        content: "You are a food-focused assistant, limited to food, recipes, and nutritional topics. "
          + "Provide five recipe ideas with a title, a brief description, and estimated caloric value per serving. "
          + "List ingredients and provide step-by-step instructions when a recipe is chosen. "
          + "Only provide a shopping list if the user requests it. If a user mentions a dish they ate, "
          + "estimate its nutritional breakdown (Calories, Carbs, Protein, Fat). "
          + "If asked about non-food topics, respond: 'I'm sorry, I can only assist with food-related topics.'"
      }
    ];
  }

  conversations[userId].push({ role: "user", content: userMessage });
  const conversationString = JSON.stringify(conversations[userId]);
  const pythonProcess = spawn('python', ['chatbot.py', conversationString]);

  let responseText = "";
  pythonProcess.stdout.on('data', (data) => {
    responseText += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "AI response failed" });
    }
    const aiResponse = responseText.trim();
    conversations[userId].push({ role: "assistant", content: aiResponse });
    res.json({ response: aiResponse });
  });
});


// ________________________________END POINTS___________________________________

//USER ENDPOINTS

// Register a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'User already exists' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// Login user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// Logout user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});


//MEAL ENDPOINTS

// Get all meals
apiRouter.get('/meals', verifyAuth, (req, res) => {
  const userMeals = meals.filter(meal => meal.userId === req.cookies[authCookieName]);
  res.send(userMeals);
});

// Add meal
apiRouter.post('/meals', verifyAuth, (req, res) => {
  const meal = {
    id: uuid.v4(),
    userId: req.cookies[authCookieName], 
    food: req.body.food,
    calories: req.body.calories,
    protein: req.body.protein,
    carbs: req.body.carbs,
    fat: req.body.fat,
    date: new Date().toISOString()
  };
  meals.push(meal);
  res.send(meal);
});

// Edit meal
apiRouter.put('/meals/:id', verifyAuth, (req, res) => {
  const meal = meals.find(m => m.id === req.params.id && m.userId === req.cookies[authCookieName]);
  if (!meal) {
    return res.status(404).send({ msg: 'Meal not found' });
  }
  meal.food = req.body.food || meal.food;
  meal.calories = req.body.calories || meal.calories;
  meal.protein = req.body.protein || meal.protein;
  meal.carbs = req.body.carbs || meal.carbs;
  meal.fat = req.body.fat || meal.fat;
  res.send(meal);
});

// Delete meal
apiRouter.delete('/meals/:id', verifyAuth, (req, res) => {
  const index = meals.findIndex(m => m.id === req.params.id && m.userId === req.cookies[authCookieName]);
  if (index === -1) {
    return res.status(404).send({ msg: 'Meal not found' });
  }
  meals.splice(index, 1);
  res.status(204).end();
});


// get user profile
apiRouter.get('/profile', verifyAuth, (req, res) => {
  const tokenFromCookie = req.cookies[authCookieName]; // Read the token from cookies
  const user = users.find(u => u.token === tokenFromCookie);

  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }

  res.send({ email: user.email });
});


// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

// Serve index.html for unknown routes
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});



//___________________________HELPER FUNCTIONS_____________________________________

// create user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email, password: passwordHash, token: uuid.v4() };
  users.push(user);
  return user;
}

//get user
async function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field] === value);
}

// Set the auth cookie
function setAuthCookie(res, authToken) {
  res.cookie('token', authToken, {
    httpOnly: true,
    secure: true, // Only over HTTPS
    sameSite: 'Strict', // or 'Lax'
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  });

}

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
