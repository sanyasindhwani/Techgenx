const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path'); // For handling file paths
const fs = require('fs'); // To read quiz.json
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve HTML, CSS, JS from public folder

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(error => console.error('MongoDB connection error:', error));

// User Schema & Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send('Team already exists. Please choose a different name.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });

        await user.save();
        res.status(201).send('Team registered successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send('Error registering team');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } else {
        res.status(401).send('Invalid username or password');
    }
});

// Route to fetch all registered teams
app.get('/teams', async (req, res) => {
    try {
        const teams = await User.find({}, 'username');
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).send('Error fetching teams.');
    }
});

// Serve the signup page at /signup
app.get('/signup-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// serve the team page
app.get('/teams-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teams.html'));
});

// Serve the login page at /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the quiz JSON data
app.get('/quiz-questions', (req, res) => {
    const quizPath = path.join(__dirname, 'public', 'quiz.json');
    fs.readFile(quizPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading quiz JSON:', err);
            res.status(500).send('Error loading quiz.');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Serve the quiz page
app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Route to submit answers and calculate result
app.post('/submit', (req, res) => {
    const { answers } = req.body; // Array of {id, selectedOption}
    const quizPath = path.join(__dirname, 'public', 'quiz.json');

    fs.readFile(quizPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading quiz JSON for results:', err);
            return res.status(500).send('Error loading quiz.');
        }

        const quizData = JSON.parse(data).questions;
        let score = 0;
        const totalQuestions = quizData.length;

        answers.forEach(({ id, selectedOption }) => {
            const question = quizData.find(q => q.id === id);
            if (question && question.answer === selectedOption) score++;
        });

        res.json({ message: 'Quiz Completed', score,total:totalQuestions });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
