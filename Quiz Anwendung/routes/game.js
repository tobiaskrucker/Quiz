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

  // Antworten in Schema "Game" für die jeweilige Runde hinterlegen
  const gameData = await Game.findOne({ _id: req.params.id })
  console.log("gameData.round: ");
  console.log(gameData.round);

  var gameAnswers = [];
  var gamePoints = [];
  gamePoints[0] = 0;
  gamePoints[1] = 0;

  

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

  if(gameData.users[0] == req.session.user._id) {
    await Game.updateOne({_id: req.params.id}, { 
      answers1: gameAnswers,
      
    });
  }
  else {
    await Game.updateOne({_id: req.params.id}, { 
      answers2: gameAnswers,
      
    });
  }

  // Punkte innerhalb des Spiels vergeben
  for(key = 0; key < 14; key++) {
    if(gameData.answers1[key]){
    gamePoints[0] += 2;}
    else if(gameData.answers1[key] === false){
    gamePoints[0] -= 1;}
  }

  for(key = 0; key < 14; key++) {
    if(gameData.answers2[key]){
    gamePoints[1] += 2;}
    else if(gameData.answers2[key] === false){
    gamePoints[1] -= 1;}
  }

  // Fragenzähler
  const countAnswers = await Game.findOne({_id: req.params.id});
  if(countAnswers.answers1.length === countAnswers.answers2.length){
    gameData.questionCount = gameData.questionCount + 2;
    }
  
  // Rundenzähler
  if(gameData.answers1.length > gameData.answers2.length)
      gameData.round = gameData.answers1.length/2;
      else gameData.round = gameData.answers2.length/2;
      console.log(gameData.answers1.length);

    await Game.updateOne({_id: req.params.id}, { 
      round: gameData.round,
      points1: gamePoints[0],
      points2: gamePoints[1],
      questionCount: gameData.questionCount
    });

    // Spiel beenden und Punkte dem User hinzufügen
    if(gameData.answers1.length == 14 && gameData.answers2.length == 14){
      let userData1 = await User.findOne({_id: gameData.users[0]});
      userData1.games += 1;
      if(gameData.points1 > gameData.points2){
        userData1.win += 1;
      }else if(gameData.points1 < gameData.points2){
        userData1.loose += 1;
      }
      await User.updateOne({_id: gameData.users[0]},{
       points: gameData.points1,
       games: userData1.games, 
       win: userData1.win,
       loose: userData1.loose
      })

      let userData2 = await User.findOne({_id: gameData.users[1]});
      userData2.games += 1;
      if(gameData.points2 > gameData.points1){
        userData2.win += 1;
      }else if(gameData.points2 < gameData.points1){
        userData2.loose += 1;
      }
      await User.updateOne({_id: gameData.users[1]},{
       points: gameData.points2,
       games: userData2.games, 
       win: userData2.win,
       loose: userData2.loose
      })
      
      //await Game.deleteOne({_id: req.params.id});
    }

  res.redirect('/overviewGame/' + gameData._id);

});

router.get('/closeGame/:id', async (req, res) => {
  // Überprüfen, ob der Benutzer angemeldet ist
  if (!req.session.user) {
    return res.redirect('/login');
  }
  await Game.deleteOne({_id: req.params.id});
  res.redirect('/dashboard');
});

module.exports = router;
