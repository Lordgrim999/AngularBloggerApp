const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    //we need decodedToken as we need to fetch user mongoose id
    //to add this user id in post route where we are creating out post
    //in creator part of post schema
    //since user id is not a part of request we need to decode it from token
    //where we have added in payload section
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //we can add the field of decodedtoken in req body and
    // on calling next we can access this field anywhere where it has been used
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'User is not authenticated' });
  }
};
