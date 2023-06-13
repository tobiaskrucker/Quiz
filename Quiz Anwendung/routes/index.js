const express = require('express');
const router = express.Router();

const User = require('../models/user');

// Registrierungsroute
router.get('/register', (req, res) => {
  res.render('register.ejs');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      //User existiert, Register Formular wird neugeladen
      return res.redirect('/register');
    }
    
    // Neuen Benutzer erstellen
    const user = new User({ username, password });
    await user.save();
    
    // Sitzungsdaten festlegen
    req.session.user = user;
    
    //Weiterleiten zum Dashboard
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Registration error:', error);
    res.redirect('/register');
  }
});

// Login-Route
router.get('/login', (req, res) => {
  res.render('login.ejs');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Informationen aus dem Formular in DB überprüfen
    const user = await User.findOne({ username, password });
    if (!user) {
      //Kein übereinstimmender User gefunden, Login Formular wird neugeladen
      return res.redirect('/login');
    }
    
    // Sitzungsdaten festlegen
    req.session.user = user;
    
    //Weiterleiten zum Dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login');
  }
});

// Dashboard-Route
router.get('/dashboard', (req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard.ejs', { user: req.session.user });
});

// Logout-Route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
