const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const keys = require('../../config/keys');

//load Input validation
const validteRegisterInput = require('../../validation/register');
const validLoginInput = require('../../validation/login');

//Load user model
const User = require('../../models/User');

//@route    GET api/users/test
//@desc     Test users route
//@access   Public
router.get('/test', (req, res) => {
  res.json({ msg: 'Hello, from users' });
});

//@route    POST api/users/register
//@desc     Register users
//@access   Public
router.post('/register', (req, res) => {
  //check validation
  const { errors, isValid } = validteRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  //first check if the user already exists
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res
        .status(400)
        .json({ email: 'User with this email already exists.' });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', //size
        r: 'pg', //Rating
        d: 'mm' //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save() //mongodb operation
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route    GET api/users/login
//@desc     Login user / Returning JWT token
//@access   Public
router.post('/login', (req, res) => {
  //validation
  const { errors, isValid } = validLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email }) //this can be also written as --> User.findOne({email : email})
    .then(user => {
      //check for user
      if (!user) {
        //if user is not found
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }

      //check password (if user email is found)
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //user matched

          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }; // create JWT payload

          //sign JWT token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            }
          );
        } else {
          errors.password = 'Incorrect password';
          res.status(400).json(errors);
        }
      });
    });
});

//@route    GET api/users/current
//@desc     Return current user
//@access   Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //since this is protected, thus passport.authenticate is used
    res.json({
      id: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar,
      email: req.user.email,
      date: req.user.date
    });
  }
);
module.exports = router;
