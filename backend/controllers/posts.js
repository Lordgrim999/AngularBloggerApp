const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  //we need to store the path to image so first we need the url
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    // here multer provide file property to the request body
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId,
  });
  //const post=req.body;
  console.log(post);

  post
    .save()
    .then(createdPost => {
      console.log(createdPost);
      res.status(201).json({
        message: 'added to database',
        //here we return the post object
        post: {
          id: createdPost._id,
          title: createdPost.title,
          description: createdPost.description,
          imagePath: createdPost.imagePath,
          creator: req.userData.userId,
        },
      });
    })
    .catch(err => {
      res.status(500).json({ message: 'Creating Post Failed' });
    });
};

exports.updatePost = (req, res, next) => {
  //in below i had to implicitly mention the id as we not it will create
  //another post schema of new id which raise error
  let imagePath = req.body.imagePath;
  //here checking wether i have edited new image or file
  if (req.file) {
    // if i have created then need to create the url of new file
    //else it will be the string of original image
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    description: req.body.description,
    imagePath: imagePath,
    creator: req.userData.userId,
  });
  console.log(post);
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then(result => {
      if (result.n > 0) {
        console.log(result);
        res.status(200).json({ message: 'Updated' });
      } else {
        res.status(401).json({ message: 'Not authorized' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Couldn't Update Post!" });
    });
};

exports.getAllPosts = (req, res, next) => {
  let postQuery = Post.find();
  let fetchedPosts;
  //default value is string of queries
  const pageSize = +req.query.pageSize; //if no parameter then undefined
  const currentPage = +req.query.currentPage;
  //logic is for pagination limiting the post to be shown on frontend
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .find()
    .then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then(count => {
      console.log(count);
      res.status(200).json({
        message: 'successfully',
        posts: fetchedPosts,
        countPosts: count,
      });
    })
    .catch(err => {
      res.status(500).json({ message: 'Fetching Post Failed!' });
    });
};

exports.getPostById = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(400).json({ message: 'form not found' });
    }
  });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        console.log(result);
        res.status(200).json({ message: 'Updated' });
      } else {
        res.status(401).json({ message: 'Not authorized' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Couldn't Update Post!" });
    });
};
