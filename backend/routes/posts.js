const express = require('express');
const multer = require('multer');
const router = express.Router();
const postController = require('../controllers/posts');
const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};
//configuring multer for incoming file stroage post request
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    //the path should be relative to server .js so only backend/

    callback(null, 'backend/images');
  },
  filename: (req, file, callback) => {
    //on changing the name of file it will loose the extension name

    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  },
});

//here we are creating new blog post
//single means we are expecting single file from post request
//and image will inform the multer to look for image property in request body
router.post(
  '',
  checkAuth,
  multer({ storage: storage }).single('image'),
  postController.createPost
);

router.get('', postController.getAllPosts);

//this get method return post info for editing called by getPost  method from postservice
router.get('/:id', postController.getPostById);

router.delete('/:id', checkAuth, postController.deletePost);

router.put(
  '/:id',
  checkAuth,
  multer({ storage: storage }).single('image'),
  postController.updatePost
);

module.exports = router;
