const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Question = require('../models/question');
const Module = require('../models/module');
const SelectedModule = require('../models/selectedModule');
const Game = require('../models/game');
const { model } = require('mongoose');

/*
wird nicht mehr benötigt
// Duellroute
router.get('/game', async (req, res) => {

   // Überprüfen, ob der Benutzer angemeldet ist
   if (!req.session.user) {
    return res.redirect('/login');
  }
  
  // Spielsuche
  let userInGame;
  let game= await Game.findOne({users: {$size:1, $ne: req.session.user}});
  if({game: {$size:0}}){
    game = new Game();
    game.users[0] = req.session.user;
    game.points[0] = 0;
    game.points[1] = 0;
    game.modus = "Duell";
    game.module = Module.findOne({_id: req.params.id});
    userInGame = 0;
  }
  else{
  game.users[1] = req.session.user;
  userInGame = 1;
  }
  await game.save();
  // Fragen zum Spiel hinzufügen nachdem der erste Benutzer hinzugefügt wurde
  if({game: {$size:1}}){
    let questions = [];

    questions = await Question.find() //Modulunterscheidung fehlt noch
    .then(allQuestions => {
      if (allQuestions.length < 14){
        console.log("Nicht genügend Fragen vorhanden");
        return;
      }
      // 14 zufällige Fragen erzeugen
      while (questions.length < 14){
        let randomIndex = Math.floor(Math.random()*allQuestions.length);
        let randomQuestion = allQuestions[randomIndex];

        if (!questions.includes(randomQuestion)){
          questions.push(randomQuestion);
        }
      }
      game.questions = questions;
    });
  }
  let countQuestion = 0;
  await game.save();
  res.render('duell.ejs', { user: req.session.user, game: game, countQuestion: countQuestion, userInGame: userInGame });
});

*/

module.exports = router;
