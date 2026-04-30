require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const config = require('./config');

const links = require('./data/links.json');
const widgets = require('./data/widgets.json');

const app = express();

app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

if (config.TEST_MODE) {
  console.log('⚠️  TEST MODE enabled — authentication is bypassed');
} else {
  passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const TEST_USER = { displayName: 'Test User', photos: [], emails: [{ value: 'test@example.com' }] };

function requireAuth(req, res, next) {
  if (config.TEST_MODE) {
    req.user = req.user || TEST_USER;
    return next();
  }
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/')
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

// Login page
app.get('/login', (req, res) => {
  if (config.TEST_MODE || req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// API routes (protected)
app.get('/api/links', requireAuth, (req, res) => {
  const sorted = [...links].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

app.get('/api/widgets', requireAuth, (req, res) => {
  res.json(widgets);
});

app.get('/api/config', requireAuth, (req, res) => {
  res.json({ refreshInterval: Number(config.REFRESH_INTERVAL) });
});

app.get('/api/user', requireAuth, (req, res) => {
  const { displayName, photos, emails } = req.user;
  res.json({
    name: displayName,
    avatar: photos && photos[0] ? photos[0].value : null,
    email: emails && emails[0] ? emails[0].value : null
  });
});

// Dashboard (protected)
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

app.listen(config.PORT, () => {
  console.log(`Link Manager running on http://localhost:${config.PORT}`);
});
