const dir = __dirname;
const express = require("express");
const viewsDir = "/home/ubuntu/CSE-110-Server/views"
const router = express.Router();

const posts_controller = require('../controllers/postsController');
const multer = require("multer");


function isImage(fileName) {
  const extensions = [".jpg", ".jpeg", ".png"];
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
    callback(null, dir+"/../photos")
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname + "-" + Date.now());
  }
})

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});


// POST request for creating a post
router.post('/create', upload.single("image"), posts_controller.create_post);

// GET request for getting all info about a post
router.get('/:post_id', posts_controller.get_info);

// GET request for getting all comments related to post
router.get('/:post_id/comments', posts_controller.get_comments);

// DELETE request for deleting a post
router.delete('/:post_id/delete', posts_controller.delete_post);

// POST request to like a post
router.post('/:post_id/like/:like_id', posts_controller.like_post);

// POST request to dislike a post
router.post('/:post_id/dislike/:dislike_id', posts_controller.dislike_post);


module.exports = router;
