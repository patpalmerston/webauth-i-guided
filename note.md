yarn install bcryptjs

const bcrypt = require('bcryptjs')

in the register pathway-----

use bcrypt to hash the plain text password of the client with this code.

const hash = bcyrpt.hashSync(user.password, 10)

user.password = hash

in the login pathway ----

in the then we will use an if statement to compate the username and the bcrypt.compareSync method to verify the user password and they hashed passowrds link up.

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

now in the users pathway ---