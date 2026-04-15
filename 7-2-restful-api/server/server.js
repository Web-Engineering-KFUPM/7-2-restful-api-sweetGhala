import express from "express";
import cors from "cors";

// import dotenv and load environment variables from .env
import dotenv from "dotenv";

import { connectDB } from "./db.js";
import { Song } from "./models/song.model.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

await connectDB(process.env.MONGO_URL);

// api/songs (Read all songs)
app.get("/api/songs", async (req, res) => {
    try {
        const rows = await Song.find().sort({ createdAt: -1 });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message || "Failed to fetch songs" });
    }
});
app.get("/api/songs/:id", async (req, res) => {
    try {
        const s = await Song.findById(req.params.id);
        if (!s) return res.status(404).json({ message: "Song not found" });
        res.json(s);
    } catch (err) {
        res.status(500).json({ message: err.message || "Failed to fetch song" });
    }
});


// api/songs (Insert song)
app.post("/api/songs", async (req, res) => {
    try {
        const { title = "", artist = "", year } = req.body || {};

        const created = await Song.create({
            title: title.trim(),
            artist: artist.trim(),
            year
        });

        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message || "Validation error" });
    }
});

// /api/songs/:id (Update song)
app.put("/api/songs/:id", async (req, res) => {
    try {
        const updated = await Song.findByIdAndUpdate(
            req.params.id,
            req.body || {},
            { new: true, runValidators: true, context: "query" }
        );

        if (!updated) {
            return res.status(404).json({ message: "Song not found" });
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message || "Update failed" });
    }
});


// /api/songs/:id (Delete song)
app.delete("/api/songs/:id", async (req, res) => {
    try {
        const deleted = await Song.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Song not found" });
        }

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message || "Delete failed" });
    }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));