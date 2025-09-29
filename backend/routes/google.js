const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

// /api/google/search?q=javascript%20interview
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q param required' });
    const resp = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q
      }
    });
    res.json(resp.data);
  } catch (err) {
    console.error(err?.message || err);
    res.status(500).json({ error: 'Google search failed', details: err.message });
  }
});

module.exports = router;
