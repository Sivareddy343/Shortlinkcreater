const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });


const db = require("./Database/db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const isValidUrl=(url) =>{
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

const isValidCode=(code)=> {
 
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

app.get("/healthz", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() AS now");
    res.json({
      ok: true,
      version: "1.0",
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    console.error("Healthcheck error:", err);
    res.status(500).json({
      ok: false,
      error: "Database connection failed",
    });
  }
});

app.post("/api/apilinks", async (req, res) => {
  try {
    const { targetUrl, code } = req.body;
    if (!targetUrl || !isValidUrl(targetUrl)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let shortCode = code;

    
    if (shortCode) {
      if (!isValidCode(shortCode)) {
        return res
          .status(400)
          .json({ error: "Code must be 6 to 8 chars, letters/numbers only" });
      }

      const existing = await db.query(
        "SELECT id FROM links WHERE code = $1",
        [shortCode]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Code already exists" });
      }
    } else {
      shortCode = Math.random().toString(36).substring(2, 10);
      shortCode = shortCode.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
      if (shortCode.length < 6) {
        shortCode = shortCode.padEnd(6, "0");
      }
    }

    const result = await db.query(
      `INSERT INTO links (code, target_url)
       VALUES ($1, $2)
       RETURNING id, code, target_url, total_clicks, last_clicked_at, created_at, updated_at`,
      [shortCode, targetUrl]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating link:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/apilinks", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, code, target_url, total_clicks, last_clicked_at, created_at, updated_at
       FROM links
       ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching links:", err);
    return res.status(500).json({ error: "Failed to fetch links" });
  }
});

app.get("/api/apilinks/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      `SELECT id, code, target_url, total_clicks, last_clicked_at, created_at, updated_at
       FROM links
       WHERE code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Link not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching link stats:", err);
    return res.status(500).json({ error: "Failed to fetch link stats" });
  }
});

app.delete("/api/apilinks/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      "DELETE FROM links WHERE code = $1 RETURNING id",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Link not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting link:", err);
    return res.status(500).json({ error: "Failed to delete link" });
  }
});

app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Ignore /healthz and /api/ prefix
    if (code === "healthz" || code === "api") {
      return res.status(404).send("Not found");
    }

    const result = await db.query(
      `SELECT id, target_url
       FROM links
       WHERE code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Short link not found");
    }

    const link = result.rows[0];

    await db.query(
      `UPDATE links
       SET total_clicks = total_clicks + 1,
           last_clicked_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [link.id]
    );

    return res.redirect(302, link.target_url);
  } catch (err) {
    console.error("Error in redirect route:", err);
    return res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
