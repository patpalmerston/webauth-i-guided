const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body; // user contains plain text password user.username, user.password
  // we want to generate a hash of the user's password
  // we'll do it synchronously, no need for async
  const hash = bcrypt.hashSync(user.password, 10); // 2 to the 10th rounds of hashing
  // override user.password with hashed version
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // update the if condition to check that the passwords match
      if(user && bcrypt.compareSync(password, user.password)) {
        return res.status(200).json({ message: `welcome ${user.username}!`})
      } else {
        // we will return a 401 if the password or username is invalid
        // we dont want to let attackers know when they have a good username
        res.status(401).json({ message: 'Invalid Credentials!' })
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted, (req, res) => {
  
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

// customer middleware for restricted access
function restricted(req, res, next) {
  // to keep the end point as a get(we cant send information in the body in a GET)
  // well read the username and password from the headers
  // when testing the endpoint add these headers in postman or insomnia
  // we will cover hwo to send headers using axios in the JWT lecture later in the week
  const { username, password } = req.headers;

  if(username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: 'Invalid credentials' })
        }
      })
      .catch(err => {
        res.status(500).json({ message: 'unexpected error!' })
      })
  } else {
    res.status(400).json({ message: 'Incomplete credentials provided' })
  }
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
