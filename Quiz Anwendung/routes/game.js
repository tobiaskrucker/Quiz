const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Question = require('../models/question');
const Module = require('../models/module');
const Game = require('../models/game');
const { model } = require('mongoose');


// Gameroute
router.get('/game/:id', async (req, res) => {

   // Überprüfen, ob der Benutzer angemeldet ist
   if (!req.session.user) {
    return res.redirect('/login');
  }
  let game = await Game.findOne({_id: req.params.id}).populate("questions");
  await game.save();
  res.render('duell.ejs', { user: req.session.user, game: game });
});

router.post('/answers/:id', async (req, res) => {

  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const formData = req.body;
  const keys = Object.keys(formData);
  console.log(formData);
  console.log(keys);
  console.log("erster wert: " + formData[keys[0]]);

  //Antworten in Schema "Game" für die jeweilige Runde hinterlegen
  const gameData = await Game.findOne({ _id: req.params.id })
 
  var gameAnswers = [];

  if(gameData.users[0] == req.session.user._id) {
    gameAnswers = gameData.answers1;
    console.log("gameData.answers1:");
    console.log(gameAnswers);
  }
  else {
    gameAnswers = gameData.answers2;
    console.log("gameData.answers2:");
    console.log(gameAnswers);
  }

  for(key = 0; key < keys.length; key++) {
    gameAnswers.push(formData[keys[key]]);
  }
  
  console.log("gameAnswers added:");
  console.log(gameAnswers);

  const round = gameData.round + 1;

  if(gameData.users[0] == req.session.user._id) {
    await Game.updateOne({_id: req.params.id}, { 
      answers1: gameAnswers,
      round: round
    });
  }
  else {
    await Game.updateOne({_id: req.params.id}, { 
      answers2: gameAnswers,
      round: round
    });
  }

  res.redirect('/overviewGame/' + gameData._id);

});

module.exports = router;
