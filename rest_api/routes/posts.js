const dir = __dirname;
const express = require("express");
const viewsDir = "/home/ubuntu/CSE-110-Server/views"
const router = express.Router();

const posts_controller = require('../controllers/postsController');
const conmments_controller = require('../controllers/commentsController');
const multer = require("multer");

const auth = require('../middleware/auth');


function isImage(fileName) {
  const extensions = [".jpg", ".jpeg", ".png", ".JPG", ".PNG", ".JPEG"];
  for(let i = 0; i < extensions.length; i++) {
    if(fileName.endsWith(extensions[i])) {
    return (null, true);
    }
  }
  return (null,false)
}

function extractExtension(fileName) {
  const extensions = [".jpg", ".jpeg", ".png"];
  for(let i = 0; i < extensions.length; i++) {
    if(fileName.endsWith(extensions[i])) {
      return extensions[i];
    }
  }
}

function fileFilter(req, file, callback) {
  let result = isImage(file.originalname);
  result ? callback(null, true) : callback(null, false);
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, dir+"../../../photos")
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  }
})

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

router.post('/test-image', upload.single("image"), (req, res) => {
  if (req.file) {
    console.log("image uploaded");
    console.log(req.file);
    res.status(200).json({
      message: "image sent",
      file: req.file
    });
  }
  else {
    console.log("error uploading image")
    res.status(500).json( {message: "error uploading image"} );
  }
})

router.get('/test-image/:id', (req, res) => {
  require('dotenv').config({path: '../../env_variables.env'});
   const dir = __dirname;
   const mysql = require('mysql').createConnection({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASS,
     database: process.env.DB_NAME,
     multipleStatements: true
  });
  const checkPostExistsQuery = "SELECT picture FROM posts WHERE post_id = ?";
  mysql.query(checkPostExistsQuery, [req.params.id], (err, result) => {
    console.log(result);
    (err)? 
      res.status(500).json(err) : 
      res.status(200).json( {
        url: 'http://18.224.14.57/api/photos/'+result[0].picture
      });
  });
})

// POST request for creating a post
router.post('/create', auth, upload.single("image"), posts_controller.create_post);

// GET request for getting all info about a post
router.get('/:post_id', posts_controller.get_info);

// GET request for getting all comments related to post
router.get('/:post_id/comments', posts_controller.get_comments);

// DELETE request for deleting a post
router.delete('/:post_id/delete', auth, posts_controller.delete_post);

// POST request to like a post
router.post('/:post_id/like', auth, posts_controller.like_post);

// POST request to dislike a post
router.post('/:post_id/dislike', auth, posts_controller.dislike_post);

module.exports = router;
