const express = require('express');
const Anime = require('../models/Anime');
const upload = require('../config/multer');
const router = express.Router();
const defaultAnimesData = require('../data.js');



router.get("/", (req, res) => {
    res.render("index");
});


router.get("/add", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const userAnimes = await Anime.find({ user: userId });

    res.render("addAnime", { username: req.session.username, userAnimes });
});


router.post("/delete/:id", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.redirect("/login");

    try {
        await Anime.deleteOne({ _id: req.params.id, user: userId });
        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        res.send("Error deleting anime.");
    }
});


router.get('/update/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.redirect('/watchlist');

    res.render('updateAnime', { anime, username: req.session.username });
});

router.post('/update/:id', async (req, res) => {
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


router.get("/dashboard", async (req, res) => {  
    const userId = req.session.userId;
    if (!userId) return res.redirect("/login");



    try {
        await Anime.deleteMany({ isDefault: { $exists: false } });
        for (let animeData of defaultAnimesData) {
            await Anime.updateOne(
                { title: animeData.title },
                {
                    $set: {
                        status: "Plan to Watch",
                        notes: "",
                        user: null,
                        isDefault: true,
                        image: animeData.image,
                        description: animeData.description,
                        genre: animeData.genre,
                        episodes: animeData.episodes
                    }
                },
                { upsert: true }
            );
        }
    } catch (err) {
        console.error("Error seeding anime:", err);
    }

    const defaultAnimes = await Anime.find({ isDefault: true });
    const userAnimes = await Anime.find({ user: userId, forDashboard: true });
    const animes = [...defaultAnimes, ...userAnimes];

    res.render("dashboard", { username: req.session.username, animes });
});



router.get("/watchlist", async (req, res) => {
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


router.post("/add-to-watchlist/:id", async (req, res) => {
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
                notes: anime.notes || "",
                user: userId,
                isDefault: false,
                forDashboard: false,
                image: anime.image,
                description: anime.description || "",
                genre: anime.genre || "",
                episodes: anime.episodes || ""
            });
        }


        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.send("Error adding anime to watchlist");
    }
});



router.get("/anime/:title", async (req, res) => {
    const title = decodeURIComponent(req.params.title);

    try {
        const anime = await Anime.findOne({ title: title });
        if (!anime) return res.status(404).send("Anime not found");


        res.render("animeDetails", {
            anime,
            username: req.session.username
        });
    } catch (err) {
        console.error("Error fetching anime details:", err);
        res.status(500).send("Error loading anime details.");
    }
});

router.post("/add", upload.single("image"), async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const fs = require("fs");
    const path = require("path");
    const { title, description, genre, episodes } = req.body;

    try {
        let imageName = "default.png";

        if (req.file) {
            const targetPath = path.join(__dirname, "assets", "anime_images", req.file.originalname);
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.renameSync(req.file.path, targetPath);


            imageName = req.file.originalname;
        }

        await Anime.create({
            title,
            description: description || "No description provided.",
            genre: genre || "Unknown",
            episodes: episodes || "Unknown",
            user: req.session.userId,
            isDefault: false,
            forDashboard: true,
            image: imageName,
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error adding anime:", err);
        res.status(500).send("Error adding anime.");
    }
});

module.exports = router;

router.get("/", (req, res) => {
  console.log("Reached homepage route");
  res.render("index");
});