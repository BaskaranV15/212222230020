const pool = require('../db/connection');
const dayjs = require('dayjs');
const generateShortCode = require('../utils/shortCodeGenerator');
const getLocationFromIP = require('../utils/getLocationFromIP');

exports.createShortUrl = async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

 
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const code = shortcode || await generateShortCode(); 
  const expiry = dayjs().add(validity, 'minute').format('YYYY-MM-DD HH:mm:ss');

  try {

    const [existing] = await pool.query('SELECT * FROM urls WHERE short_code = ?', [code]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Shortcode already exists' });
    }


    await pool.query(
      'INSERT INTO urls (original_url, short_code, expiry) VALUES (?, ?, ?)',
      [url, code, expiry]
    );

    res.status(201).json({
      shortLink: `${req.protocol}://${req.headers.host}/${code}`, 
      expiry: new Date(expiry).toISOString()
    });
  } catch (error) {
    console.error("DB Error in createShortUrl:", error); 
    res.status(500).json({ error: 'Database error' });
  }
};

exports.redirectShortUrl = async (req, res) => {
  const { code } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM urls WHERE short_code = ?', [code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Shortcode not found' });

    const url = rows[0];
    if (new Date() > new Date(url.expiry)) {
      return res.status(410).json({ error: 'Link expired' });
    }

    const referrer = req.get('Referrer') || 'Unknown';
    const location = await getLocationFromIP(req.ip);

    await pool.query(
      'INSERT INTO clicks (url_id, referrer, location) VALUES (?, ?, ?)',
      [url.id, referrer, location]
    );

    return res.redirect(url.original_url);
  } catch (error) {
    console.error("Redirection error:", error); 
    res.status(500).json({ error: 'Redirection error' });
  }
};

exports.getShortUrlStats = async (req, res) => {
  const { code } = req.params;

  
  if (!/^[a-zA-Z0-9_-]{4,20}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid shortcode format' });
  }

  try {
    //short URL by code
    const [urls] = await pool.query(
      'SELECT * FROM urls WHERE short_code = ?',
      [code]
    );

    if (urls.length === 0) {
      return res.status(404).json({ error: 'Shortcode not found' });
    }

    const url = urls[0];

    const [clicks] = await pool.query(
      'SELECT timestamp, referrer, location FROM clicks WHERE url_id = ? ORDER BY timestamp DESC',
      [url.id]
    );

    // Construct the response object
    res.status(200).json({
      shortcode: code,
      originalUrl: url.original_url,
      createdAt: new Date(url.created_at).toISOString(),
      expiry: new Date(url.expiry).toISOString(),
      totalClicks: clicks.length,
      clicks: clicks.map(click => ({
        timestamp: new Date(click.timestamp).toISOString(),
        referrer: click.referrer,
        location: click.location
      }))
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

const Log = require('../utils/logger');

exports.createShortUrl = async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || !url.startsWith('http')) {
    await Log("backend", "error", "handler", "Invalid URL format");
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    await Log("backend", "info", "controller", `Creating short URL for ${url}`);
  } catch (err) {
    await Log("backend", "fatal", "db", "Database insert failed in createShortUrl");
    res.status(500).json({ error: 'Database error' });
  }
};
