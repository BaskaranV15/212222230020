require('dotenv').config();
const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const urlRoutes = require('./routes/urlRoutes');

app.use(express.json());
app.use(logger);
app.use('/', urlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
