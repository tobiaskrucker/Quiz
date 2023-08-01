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
  console.log(keys);
  console.log(formData);


  // Antworten in Schema "Game" für die jeweilige Runde hinterlegen
  const gameData = await Game.findOne({ _id: req.params.id })

  var gameAnswers = [];
  var gameComments = gameData.comments;
  var gamePoints = [];
  gamePoints[0] = 0;
  gamePoints[1] = 0;

  

  if(gameData.users[0] == req.session.user._id) {
    gameAnswers = gameData.answers1;
  }
  else {
    gameAnswers = gameData.answers2;
  }

  for(key = 0; key < keys.length; key++) {
    if(keys[key] != "comment") {
      gameAnswers.push(formData[keys[key]]);
    }
    else {
      gameComments[gameData.round - 1].commentQuestion1 = formData.comment[0];
      gameComments[gameData.round - 1].commentQuestion2 = formData.comment[1];
    }
  }


  if(gameData.users[0] == req.session.user._id) {
    await Game.updateOne({_id: req.params.id}, { 
      answers1: gameAnswers,
      comments: gameComments
    });
  }
  else {
    await Game.updateOne({_id: req.params.id}, { 
      answers2: gameAnswers,
      comments: gameComments
    });
  }

  const gameDataPoints = await Game.findOne({ _id: req.params.id });

  // Punkte innerhalb des Spiels berechnen
  for(answer = 0; answer < 14; answer++) {
    if(gameDataPoints.modus == "Kollaborativ") {
      if((gameDataPoints.answers1[answer] == gameDataPoints.answers2[answer]) && gameDataPoints.answers1[answer] == true && gameDataPoints.answers2[answer] == true ) {
        gamePoints[0] += 2;
        gamePoints[1] += 2;
      }
    }
    if(gameDataPoints.answers1[answer] == true) {
      gamePoints[0] += 2;
    }
    else if(gameDataPoints.answers1[answer] == false) {
      gamePoints[0] -= 1;
    }
    if(gameDataPoints.answers2[answer] == true) {
      gamePoints[1] += 2;
    }
    else if(gameDataPoints.answers2[answer] == false) {
      gamePoints[1] -= 1;
    }
  }

  // Fragenzähler
  const countAnswers = await Game.findOne({_id: req.params.id});
  if(countAnswers.answers1.length === countAnswers.answers2.length){
    gameData.questionCount = gameData.questionCount + 2;
    }
  
  // Rundenzähler
  if(gameData.answers1.length > gameData.answers2.length)
      gameData.round = gameData.answers1.length/2;
      else if(gameData.answers1.length == gameData.answers2.length)
      gameData.round = gameData.round + 1;
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
      userData1.points += gameData.points1;
      await User.updateOne({_id: gameData.users[0]},{
       points: userData1.points,
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
      userData2.points += gameData.points2;
      await User.updateOne({_id: gameData.users[1]},{
       points: userData2.points,
       games: userData2.games, 
       win: userData2.win,
       loose: userData2.loose
      })
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
