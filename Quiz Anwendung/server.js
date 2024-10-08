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

// Routers registrieren
const mainRouter = require('./routes/index');
app.use('/', mainRouter);

// Server starten
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
