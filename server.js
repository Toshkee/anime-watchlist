const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const app = express();
const path = require('path');


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));



mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

const User = require('./models/User');
const Anime = require('./models/Anime');

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/add", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const userAnimes = await Anime.find({ user: userId });

    res.render("addAnime", { username: req.session.username, userAnimes });
});


app.post("/add", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");
    const { title, status, notes } = req.body;

    try {
        await Anime.create({
            title,
            status,
            notes: notes || "",
            user: req.session.userId,
            isDefault: false,
            forDashboard: true
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        res.send("Error adding anime.");
    }
});

app.post("/delete/:id", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect("/login");

    try {
        await Anime.deleteOne({ _id: req.params.id, user: userId });
        res.redirect("/watchlist");
    } catch (err) {
        console.log(err);
        res.send("Error deleting anime.");
    }
});


app.get('/update/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.redirect('/watchlist');

    res.render('updateAnime', { anime, username: req.session.username });
});

app.post('/update/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { status, notes } = req.body;

    try {
        await Anime.findByIdAndUpdate(req.params.id, {
            status,
            notes: notes || ""
        });
        res.redirect('/watchlist');
    } catch (err) {
        console.log(err);
        res.send('Error updating anime.');
    }
});



app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect("/login");
});

app.get("/login", async (req, res) => {
    console.log("get login");
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.redirect("/dashboard");
    }
    res.redirect("/login");
});


app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect("/login");
    });
});


app.get("/dashboard", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect("/login");


    const defaultList = [
        "One Piece", "Demon Slayer", "Naruto", "Hunter x Hunter", "Monster",
        "Black Clover", "Bleach", "Dragon Ball", "Code Geass", "Neon Genesis Evangelion",
        "Cowboy Bebop", "Death Note", "Berserk", "JoJo's Bizarre Adventure",
        "Attack on Titan", "Vinland Saga", "Hajime no Ippo", "Jujutsu Kaisen",
        "Haikyu", "Pokemon"
    ];


    for (let title of defaultList) {
        const exists = await Anime.findOne({ title: title, isDefault: true });
        if (!exists) {
            await Anime.create({
                title,
                status: "Plan to Watch",
                rating: 0,
                notes: "",
                user: null,
                isDefault: true
            });
        }
    }

    const defaultAnimes = await Anime.find({ isDefault: true });
    const userAnimes = await Anime.find({ user: userId, forDashboard: true });
    const animes = [...defaultAnimes, ...userAnimes];

    res.render("dashboard", { username: req.session.username, animes });
});


app.get("/watchlist", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.redirect("/login");


        const myAnimes = await Anime.find({ user: userId, forDashboard: false });

        res.render("watchlist", { myAnimes, username: req.session.username });
    } catch (err) {
        console.error(err);
        res.send("Error fetching watchlist");
    }
});


app.post("/add-to-watchlist/:id", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.redirect("/login");

        const anime = await Anime.findById(req.params.id);

        if (!anime) return res.redirect("/dashboard");

        
        if (!anime.isDefault && !(anime.forDashboard && anime.user.equals(userId))) {
            return res.redirect("/dashboard");
        }

        
        const alreadyAdded = await Anime.findOne({
            title: anime.title,
            user: userId,
            forDashboard: false
        });

        if (!alreadyAdded) {
            await Anime.create({
                title: anime.title,
                status: anime.status,
                rating: anime.rating || 0,
                notes: anime.notes || "",
                user: userId,
                isDefault: false,
                forDashboard: false
            });
        }

        
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.send("Error adding anime to watchlist");
    }
});


app.get("/anime/:title", async (req, res) => {
    const title = decodeURIComponent(req.params.title);
    const anime = await Anime.findOne({ title: title });

    if (!anime) {
        return res.status(404).send("Anime not found");
    }

    res.render("animeDetails", { anime, username: req.session.username });
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});


