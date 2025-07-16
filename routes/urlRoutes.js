const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  redirectShortUrl,
  getShortUrlStats
} = require('../controllers/urlController');

router.post('/shorturls', createShortUrl);
router.get('/shorturls/:code', getShortUrlStats);
router.get('/:code', redirectShortUrl);

module.exports = router;
