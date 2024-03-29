const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const signup_validations = require("../validations/signup");
const User = require("../models/User");

const passport = require("passport");

const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth.js');


router.get("/", ensureAuthenticated, (req, res) => {
  res.render("Home.ejs", { name: req.user.name });
});

router.get("/signin",forwardAuthenticated, (req, res) => {
  res.render("Sign In", {
    title: ".Blogger | Sign In",
    css: "Sign In.css",
  });
});

router.post("/signin", (req, res,next) => {
  const { username, password } = req.body;
  if (username === "" || password === "") {
    return res.send("Error: You must enter your username and password");
  } else {
    console.log(req.body);
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/signin",
      failureFlash: true,
    })(req, res, next);
  }
});

router.get("/signup", forwardAuthenticated, (req, res) => {
  res.render("Sign Up", {
    title: ".Blogger | Sign Up",
    css: "Sign Up.css",
  });
});

router.post(
  "/signup",
  signup_validations,
  async (req, res) => {
    let errors = validationResult(req).errors;
    if (req.body.password !== req.body.confirmPassword)
      errors.push({ param: "confirmPassword", msg: "Passwords don't match!" });
    if (errors.length) {
      return res.render("Sign Up", {
        title: ".Blogger | Sign Up",
        css: "Sign Up.css",
        ...req.body, // spread operator
        errors,
        errIndex_firstname: errors.findIndex(
          (error) => error.param == "firstname"
        ),
        errIndex_lastname: errors.findIndex(
          (error) => error.param == "lastname"
        ),
        errIndex_username: errors.findIndex(
          (error) => error.param == "username"
        ),
        errIndex_email: errors.findIndex((error) => error.param == "email"),
        errIndex_password: errors.findIndex(
          (error) => error.param == "password"
        ),
        errIndex_confirmPassword: errors.findIndex(
          (error) => error.param == "confirmPassword"
        ),
        errIndex_birthdate: errors.findIndex(
          (error) => error.param == "birthdate"
        ),
        errIndex_gender: errors.findIndex((error) => error.param == "gender"),
      });
    }
    try {
      errors = [];

      let user = await User.findOne({ username: req.body.username });
      if (user)
        errors.push({ param: "username", msg: "Username is already taken!" });

      user = await User.findOne({ email: req.body.email });
      if (user) errors.push({ param: "email", msg: "Email is already taken!" });

      if (errors.length) {
        return res.render("Sign Up", {
          title: ".Blogger | Sign Up",
          css: "Sign Up.css",
          ...req.body, // spread operator
          errors,
          errIndex_username: errors.findIndex(
            (error) => error.param == "username"
          ),
          errIndex_email: errors.findIndex((error) => error.param == "email"),
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);

      // Store hash in your password DB.
      req.body.password = hash;
      user = new User(req.body);
      user = await user.save();
      console.log(`User created:\n${user}`);
      req.flash("success", "You registered successfully!");
      res.redirect("/auth/signin");
    } catch (err) {
      console.log(err);
      res.send("Error");
    }
  }
);

router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/auth/signin");
});



module.exports = router;
