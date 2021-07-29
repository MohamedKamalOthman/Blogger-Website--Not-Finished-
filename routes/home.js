const router = require('express').Router();
const Post = require('../models/Post');

router.get('/',checkAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ createdAt: 1 });
        res.render('Home', {
            title: ".Blogger",
            css: "Home.css",
            js: "Home.js",
            posts
        });
    } catch (err) {
        console.error(err);
        return res.send("Error");
    }
});
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect("/auth/signin");
  }
module.exports = router;