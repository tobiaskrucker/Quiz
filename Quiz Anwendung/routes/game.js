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
  if(game.modus === "Duell")
  res.render('duell.ejs', { user: req.session.user, game: game });
  // Hier muss noch durch die Oberfläche des kollaborativen Mouds ersetzt werden
  else res.render('duell.ejs', { user: req.session.user, game: game });
});

module.exports = router;
