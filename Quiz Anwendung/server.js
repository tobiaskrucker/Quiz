const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// MongoDB-Verbindung herstellen
mongoose.connect('mongodb://dbAccount:password@127.0.0.1:27017/myapp?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Verbindung zu MongoDB hergestellt');
  })
  .catch((err) => {
    console.error('Fehler bei der Verbindung zu MongoDB:', err);
  });

// Einstellungen für die Sitzung/Session
app.use(session({
  secret: 'mysecretkey',
  resave: true,
  saveUninitialized: true
}));

// EJS als Template-Engine festlegen
app.set('view engine', 'ejs');

// Body-Parser verwenden
app.use(bodyParser.urlencoded({ extended: true }));

// lokales Verzeichnis verwenden
app.use(express.static(__dirname + '/assets'));

// Routers registrieren
const mainRouter = require('./routes/index');
const gameRouter = require('./routes/game');
app.use('/', mainRouter);
app.use('/', gameRouter);

// Server starten
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
