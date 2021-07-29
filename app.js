const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const app = express();

const PORT = 8080;

const db = require('./mongo');
db();
// Passport Config
require('./config/passport')(passport);



app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(session({
//     cookie: { maxAge: 60000 },
//     secret: 'woot',
//     resave: false,
//     saveUninitialized: false
// }));
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.set('view engine', 'ejs');
// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );



  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Connect flash
  app.use(flash());
  

app.use(require('./routes/home'));
app.use(require('./routes/posts'));
app.use('/auth', require('./routes/users'));

app.listen(PORT, (err) => {
    if (err) return console.error(err);
    console.log(`Server is listening at http://localhost:${PORT}`);
});