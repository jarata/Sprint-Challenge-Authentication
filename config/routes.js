const axios = require('axios');

const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig');
const jwt = require('jsonwebtoken');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;
  db('users').insert(user)
      .then(u => {
        res.status(201).json({
          message: "New user registered!", u
        })
      })
      .catch(e => {
        res.status(500).json({
          error: "Error 500 /register", e
        })
      })
}

function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username
    };
    const options = {
        expiresIn: '1d'
    };
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, options)
}

function login(req, res) {
  // implement user login
    let {username, password} = req.body;
    db('users').where({username})
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = generateToken(user);
                res.status(200).json({
                    message: "Welcome you are logged in with a token!", token
                })
            } else {
                res.status(401).json({
                    message: "Invalid credentials"
                })
            }
        })
        .catch(e => {
            res.status(500).json(e)
        })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
