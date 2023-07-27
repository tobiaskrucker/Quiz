const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Question = require('../models/question');
const Module = require('../models/module');
const Game = require('../models/game');
const { model } = require('mongoose');

// Registrierungsroute
router.get('/register', (req, res) => {
  res.render('register.ejs', { registerError: '' });
});

router.post('/register', async (req, res) => {
  const { email, password, confPassword } = req.body;
  
  const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  const allowedMailDomains = [
    "iubh-fernstudium.de",
    "iu-fernstudium.de",
    "iubh-dualesstudium.de",
    "iu-dualesstudium.de",
    "iu.org",
    "iubh.org",
    "iu.de",
    "iubh.de"
  ];

  try {
    //Validierung, ob eine E-Mail-Adresse im korrekten Format eingegeben wurde
    if(!email.match(mailFormat)) {
      //Eingabe ist keine korrekte E-Mail-Adresse, Register Formular wird neugeladen
      res.render('register', { registerError: 'modalEmailIncorrect'});
      throw new Error('E-Mail-Adresse stimmt nicht mit dem notwendigen Format überein.');
    }

    //Validierung, ob eine E-Mail-Adresse der IU zugeordnet ist
    const emailDomain = email.split('@')[1];
    if(!allowedMailDomains.includes(emailDomain)) {
      //Eingabe ist keine korrekte E-Mail-Adresse, Register Formular wird neugeladen
      res.render('register', { registerError: 'modalNoIUMail'});
      throw new Error('E-Mail-Adresse ist nicht der IU zuzuordnen.');
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
router.get('/dashboard', async ( req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const game = await Game.find({});
  const module = await Module.find({});
  res.render('dashboard.ejs', { user: req.session.user, game: game, module: module});
  
});

// Modeselect-Route
router.get('/modeselect', (req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('modeSelect.ejs', { user: req.session.user });
});

//Modulselect-Route
router.post('/selectMode', async (req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // Modus wird über Button ausgewählt
  const formData = req.body;
  req.session.setup = formData.mode;

  // Weiterleitung zur Modulauswahl
  const module = await Module.find();
  res.render('modulSelect.ejs', { user: req.session.user, setup: req.session.setup, module: module });
});

//Gamesetup-Route
router.post('/selectModule', async (req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Modul wird über Button ausgewählt
  const formData = req.body;
  const games = await Game.find({ modus: req.session.setup, module: formData.module })

  var openGame;

  // Prüfen auf offene Spiele
if(games.length > 0){
  games.forEach( function(game){

      if (game.users.length < 2){
        game.users.forEach( function(user){

          if(user != req.session.user._id){
            openGame = game._id;
            game.users[1] = req.session.user._id;
            game.save();
            res.redirect('/dashboard');
            return;
          }
        })
      }
    });
  }

// Anlegen eines Spiels, falls keine offenen Spiele vorhanden sind
if(!openGame){
  var newGame = new Game();
  newGame.users[0] = req.session.user;
  newGame.points[0] = 0;
  newGame.points[1] = 0;
  newGame.modus = req.session.setup;
  newGame.module = formData.module;
  await newGame.save(); 

    res.redirect('/dashboard');
  }

});

// Modulverwaltung-Route
router.get('/modmanagement', async (req, res) => {
  try{
    // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  } 
  const module = await Module.find({});
  // Überprüfen, ob es bereits ein Modul gibt. Falls nicht, wird ein "TestModul" erstellt
  /*if(module.length === 0){
    module = new Module({name: "TestModul"})
    await module.save();
  }*/

  const user = await User.find({});
  res.render('modmanagement.ejs', { user: req.session.user, module: module });
}catch(error){
  console.log("Modulaufruf fehlgeschlagen")
}

});

// Fragenverwaltung-Route
router.post('/moduleselect/:id', async (req, res) => {
  try{
    // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  /* ausgewähltes Modul in der Datenbank als "SelectedModul" speichern
  const { moduleselect } = req.body;
  let selectedModule = await Module.findOne();
  if (!selectedModule) {
    selectedModule = new SelectedModule();
  }
  selectedModule.name = moduleselect;
  await selectedModule.save();
  */
  const module = await Module.findOne({_id: req.params.id})
  const question = await Question.find({module: module._id});
  res.render('qmanagement.ejs', { user: req.session.user, module: module, moduleselect: module, question: question });
}catch(error){
  console.log("Fragenaufruf fehlgeschlagen")
}
});

router.get('/qmanagement', async (req, res) => {
  const question = await Question.find({});
  res.render('qmanagement.ejs', { user: req.session.user, question: question });
});

// Logout-Route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

//AddModule-Route
router.get('/addModule', (req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('addModule.ejs',  { user: req.session.user });
});

router.post('/addModule', async (req, res) => {
  try {
  const formData = req.body;
    // Informationen aus dem Formular in DB speichern
    const newModule = new Module({
        name: formData.name,
    })
    await newModule.save();
    // Weiterleiten zur Modulübersicht
    res.redirect('/modmanagement');
  }catch(error){
    console.log("Aufruf Formular für neues Modul fehlgeschlagen")
  }
});

//AddQuestion-Route
router.get('/addQuestion/:id', async(req, res) => {
  try{
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  let moduleselect = await Module.findOne({_id: req.params.id});
  res.render('addQuestion.ejs',  { user: req.session.user, moduleselect: moduleselect });
}catch(error){
  console.log("Aufruf Formular für neue Frage fehlgeschlagen")
}
});


router.post('/addQuestion/:id', async (req, res) => {
  try {
    // Überprüfen, ob der Benutzer angemeldet ist
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const formData = req.body;
    let module = await Module.findOne({_id: req.params.id});
      // Informationen aus dem Formular in DB speichern
      const newQuestion = new Question({
          question: formData.question,
          rightAnswer: formData.rightAnswer,
          answer2: formData.answer2,
          answer3: formData.answer3,
          answer4: formData.answer4, 
          explanation: formData.explanation,
          module: module._id        
    })    
    await newQuestion.save();
   
    // Weiterleiten zum Modul
    res.redirect('/modmanagement');
  } catch (error) {
    console.error('Frage kann nicht angelegt werden: ', error);
    res.render('addQuestion', { errorMessage: error.message });
  }
});


//EditQuestion-Route
router.get('/editQuestion/:id', async (req, res) => {
  try {
    // Überprüfen, ob der Benutzer angemeldet ist
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if(req.session.user.role != "admin") {
      return res.redirect('/dashboard');
    }
    let question = await Question.findOne({_id: req.params.id});
    console.log(question);
    if(!question) {
      // Weiterleiten zum Modul
      res.redirect('/modmanagement');
    }

    let moduleselect = await Module.findOne({_id: question.module});
    res.render('addQuestion.ejs',  { user: req.session.user, moduleselect: moduleselect, questionData: question });
  } 
  catch (error) {
    console.log("Aufruf Formular für Frage bearbeiten fehlgeschlagen")
  }
});

//SaveQuestion-Route
router.post('/saveQuestion/:id', async (req, res) => {
  try {
    // Überprüfen, ob der Benutzer angemeldet ist
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if(req.session.user.role != "admin") {
      return res.redirect('/dashboard');
    }
    const formData = req.body;
    await Question.updateOne({_id: req.params.id}, { 
      question: formData.question,
      rightAnswer: formData.rightAnswer,
      answer2: formData.answer2,
      answer3: formData.answer3,
      answer4: formData.answer4, 
      explanation: formData.explanation
    });
    // Weiterleiten zum Modul
    res.redirect('/modmanagement');
  } 
  catch (error) {
    console.log("Speichern der zu bearbeitenden Frage fehlgeschlagen")
  }
});

//DeleteQuestion-Route
router.post('/deleteQuestion/:id', async (req, res) => {
  try {
    // Überprüfen, ob der Benutzer angemeldet ist
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if(req.session.user.role != "admin") {
      return res.redirect('/dashboard');
    }
    await Question.deleteOne({_id: req.params.id});
    // Weiterleiten zum Modul
    res.redirect('/modmanagement');
  } 
  catch (error) {
    console.log("Löschen der zu bearbeitenden Frage fehlgeschlagen")
  }
});

module.exports = router;

