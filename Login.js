const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Mongoose model for User

const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });

  try {
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(400).send('Error creating user');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  const quizCompleted = localStorage.getItem('quizCompleted');

  if (user && await bcrypt.compare(password, user.password) && quizCompleted !== 'true') {
    const token = jwt.sign({ id: user._id }, 'secret-key');
    console.log(quizCompleted)
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});
