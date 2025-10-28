const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');




router.get("/register", (req, res) => {
    res.render("register");
});


router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect("/login");
});

router.get("/login", async (req, res) => {
    console.log("get login");
    res.render("login");
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.redirect("/dashboard");
    }
    res.redirect("/login");
});


router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect("/login");
    });
});

router.get('/', (req, res) => {
  res.send('Hello from my Heroku app!');
});

router.post('/api/data', (req, res) => {
  res.send('POST request received!');
});


module.exports = router;