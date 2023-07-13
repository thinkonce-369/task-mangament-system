

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/task-management-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetToken: { type: String },
  resetTokenExpiration: { type: Date }
});

const User = mongoose.model('User', userSchema);

// Configure Nodemailer for password reset emails
const transporter = nodemailer.createTransport({
  // Configure your email provider here
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Passport.js configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username' });
    bcrypt.compare(password, user.password, (err, res) => {
      if (err) return done(err);
      if (res === false) return done(null, false, { message: 'Incorrect password' });
      return done(null, user);
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Create a new user
app.post('/users', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Failed to create user' });

    const newUser = new User({
      username,
      password: hashedPassword
    });

    newUser.save()
      .then(user => res.json(user))
      .catch(err => res.status(500).json({ error: 'Failed to create user' }));
  });
});

// Login route
app.post('/login', passport.authenticate('local'), (req, res) => {
  // Authentication successful, redirect or return success response
  res.json({ message: 'Authentication successful' });
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

// Protected route - only authenticated users can access
app.get('/protected', (req, res) => {
  if (req.isAuthenticated()) {
    // Authorized access, return data or render page
    res.json({ message: 'Protected data' });
  } else {
    // Unauthorized access, redirect or return error response
    res.status(401).json({ error: 'Unauthorized access' });
  }
});

// Password reset request
app.post('/reset-password', (req, res) => {
  // Code for password reset functionality
});

// Password reset validation and update
app.post('/reset-password/:token', (req, res) => {
  // Code for password reset functionality
});

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
