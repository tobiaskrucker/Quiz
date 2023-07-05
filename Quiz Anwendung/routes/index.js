const express = require('express');
const router = express.Router();

const User = require('../models/user');

// Registrierungsroute
router.get('/register', (req, res) => {
  res.render('register.ejs', { registerError: '' });
});

router.post('/register', async (req, res) => {
  const { email, password, confPassword } = req.body;
  
  try {
    //Validierung, ob eine E-Mail-Adresse im korrekten Format eingegeben wurde
    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!email.match(mailFormat)) {
      //Eingabe ist keine korrekte E-Mail-Adresse, Register Formular wird neugeladen
      throw new Error('E-Mail-Adresse stimmt nicht mit dem notwendigen Format überein.');
    }

    //Passwort-Felder auf Gleichheit überprüfen
    if(password != confPassword) {
      //Passworte stimmen nicht überein, Register Formular wird neugeladen
      res.render('register', { registerError: 'modalPwNotSame'});
      throw new Error('Die Passworte stimmen nicht überein.');
    }

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      //User existiert, Register Formular wird neugeladen
      res.render('register', { registerError: 'modalUserExists'});
      throw new Error('Der Account existiert bereits.');
    }
    
    //Username definieren
    const username = email.split('@')[0];

    // Neuen Benutzer erstellen
    const user = new User({ 
      email: email,
      username: username,
      password: password,
      role: "user"
    });
    await user.save();
    
    // Sitzungsdaten festlegen
    req.session.user = user;
    
    //Weiterleiten zum Dashboard
    res.redirect('/login');

  } catch (error) {
    console.error('Registration-Fehler:', error);
  }
});

// Login-Route
router.get('/login', (req, res) => {
  let loginError = false;
  res.render('login.ejs', { loginError: false });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Informationen aus dem Formular in DB überprüfen
    const user = await User.findOne({ email, password });
    if (!user) {
      throw new Error('Benutzername oder Passwort falsch.');
    }

    // Sitzungsdaten festlegen
    req.session.user = user;
    
    // Weiterleiten zum Dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login-Fehler:', error);
    res.render('login', { loginError: true, errorMessage: error.message });
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
