require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Thay bằng URL của Neon PostgreSQL
    ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

/** 🔥 Lấy danh sách tất cả chủ đề */
app.get("/", async (req, res) => {
    const result = await pool.query("SELECT * FROM topics");
    res.json(result.rows);
});
app.get("/api/topics", async (req, res) => {
    const result = await pool.query("SELECT * FROM topics");
    res.json(result.rows);
});

/** 🔥 Thêm chủ đề mới */
app.post("/api/topics", async (req, res) => {
    const { name } = req.body;
    await pool.query("INSERT INTO topics (name) VALUES ($1)", [name]);
    res.json({ message: "Chủ đề đã được thêm" });
});

/** 🔥 Lấy danh sách từ vựng theo chủ đề */
app.get("/api/words/:topic_id", async (req, res) => {
    const { topic_id } = req.params;
    const result = await pool.query("SELECT * FROM words WHERE topic_id = $1", [topic_id]);
    res.json(result.rows);
});
/** 🔥 Lấy thông tin từ vựng theo ID */
app.get("/api/words/detail/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM words WHERE id = $1", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy từ vựng" });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi khi lấy thông tin từ vựng" });
    }
});
app.put("/api/words/:id", async (req, res) => {
    const { id } = req.params;
    const { hiragana, katakana, kanji, romaji, meaning } = req.body;

    try {
        await pool.query(
            "UPDATE words SET hiragana = $1, katakana = $2, kanji = $3, romaji = $4, meaning = $5 WHERE id = $6",
            [hiragana, katakana, kanji, romaji, meaning, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi cập nhật dữ liệu" });
    }
});


// app.delete("/api/words/:id", async (req, res) => {
//     const { id } = req.params;
//     await db.query("DELETE FROM words WHERE id = $1", [id]);
//     res.json({ success: true });
// });
/** 🔥 Thêm từ vựng */
app.post("/api/words", async (req, res) => {
    const { topic_id, hiragana, katakana, kanji, romaji, meaning } = req.body;
    await pool.query(
        "INSERT INTO words (topic_id, hiragana, katakana, kanji, romaji, meaning) VALUES ($1, $2, $3, $4, $5, $6)",
        [topic_id, hiragana, katakana, kanji, romaji, meaning]
    );
    res.json({ message: "Thêm từ vựng thành công" });
});

/** 🔥 Xóa từ vựng */
app.delete("/api/words/:id", async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM words WHERE id = $1", [id]);
    res.json({ message: "Xóa từ vựng thành công" });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
