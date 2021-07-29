const router = require('express').Router();
const { validationResult } = require('express-validator');
const createPost_validations = require('../validations/create-post');
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/create-post',checkAuthenticated, (req, res) => {
    res.render('Create Post', {
        title: ".Blogger | Create Post",
        css: "Create Post.css"
    });
});

router.post('/create-post', checkAuthenticated,createPost_validations, async (req, res) => {
    let errors = validationResult(req).errors;
    if (errors.length) {
        return res.render('Create Post', {
            title: ".Blogger | Create Post",
            css: "Create Post.css",
            ...req.body, // spread operator
            errors,
            errIndex_postTitle: errors.findIndex(error => error.param == 'postTitle'),
            errIndex_postContent: errors.findIndex(error => error.param == 'postContent')
        });
    }
    try {
        req.body.author= req.user.firstname+req.user.lastname; //TODO:
        let post = new Post(req.body);
        post = await post.save();
        console.log(`Post created:\n${post}`);
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect("/auth/signin");
  }
module.exports = router;