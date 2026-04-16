require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_keyboard_cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Conectado a MongoDB Atlas"))
    .catch(err => console.error("Error de conexión a Mongo: ", err));

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: {type: String, required: true },
    highScore: { type: Number, default: 0},
    highscorepve: {type: Number, default: 0},
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'Usuario no encontrado' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Contraseña incorrecta' });
        
        return done(null, user);
    } catch (err) { 
        return done(err); 
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ success: false, message: info.message });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ success: true, user: user.username });
        });
    })(req, res, next);
});

app.post('/update-score', async (req, res) => {
    try {
        const { score, mode } = req.body;

        const user = await User.findById(req.user._id);

        let currentSingle = user.highScore || 0;
        let currentPvE = user.highscorepve || 0;

        let isNewRecord = false;
        let currentHigh = 0;

        if (mode === "single") {
            if (score > currentSingle) {
                user.highScore = score;
                isNewRecord = true;
            }
            currentHigh = user.highScore;
        } else if (mode === "pve") {
            if (score > currentPvE) {
                user.highscorepve = score;
                isNewRecord = true;
            }
            currentHigh = user.highscorepve;
        }
        
        if (isNewRecord) await user.save();
        
        res.json({ success: true, isNewRecord: isNewRecord, highScore: currentHigh });
    } catch (e) {
        console.error("Error al guardar puntos:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/scoreboard', async (req, res) => {
    try {
        const topSingle = await User.find({}, 'username highScore').sort({ highScore: -1 }).limit(10);
        const topPvE = await User.find({}, 'username highscorepve').sort({ highscorepve: -1 }).limit(10);
        
        res.json({ success: true, topSingle, topPvE });
    } catch (e) {
        console.error("Error cargando scoreboard:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`http://localhost:${PORT}`);
});