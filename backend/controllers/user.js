const User = require('../models/user');
//this package is used for encypting
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = (req, res, next) => {
  // here we are encrypting our password
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: 'User Created',
        });
      })
      .catch(err => {
        res
          .status(500)
          .json({ message: 'Invalid authentication credentials!' });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: "email doesn't exist" });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({ message: 'Auth Failed' });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      );
      res
        .status(200)
        .json({ token: token, expiresIn: 3600, userId: fetchedUser._id });
    })
    .catch(err => {
      return res
        .status(401)
        .json({ message: 'Invalid authentication credentials' });
    });
};
