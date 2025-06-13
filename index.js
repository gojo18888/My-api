const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const creator = "@gojomd";
const app = express();

// Scraper class import
const CineSubz = require('./scraper/cinesubz');
const cine = new CineSubz();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    creator,
    message: '🎬 CineSubz API is running!',
    endpoints: ['/api/cine/search?q=', '/api/cine/movie?url=', '/api/cine/tvshow?url=', '/api/cine/episode?url=', '/api/cine/download?url=', ],
  });
});

// Search route
app.get('/api/cine/search', async (req, res) => {
  const q = req.query.q || req.query.text;
  if (!q) {
    return res.status(400).json({
      status: false,
      creator,
      message: '❗ Query parameter "q" or "text" is required.',
    });
  }

  try {

    const data = await cine.search(q);
    res.status(200).json({
      status: true,
      creator,
      result: data,
    });

  } catch (error) {
    console.error("❌ Error in /search:", error.message);
    res.status(500).json({
      status: false,
      creator,
      error: error.message || 'Unexpected error occurred',
    });
  }
});

// Movie route
app.get('/api/cine/movie', async (req, res) => {
  const q = req.query.url || req.query.link;
  if (!q) {
    return res.status(400).json({
      status: false,
      creator,
      message: '❗ Query parameter "url" or "link" is required.',
    });
  }

  try {
    
    const data = await cine.movieDl(q);
    res.status(200).json({
      status: true,
      creator,
      result: data,
    });

  } catch (error) {
    console.error("❌ Error in /movie:", error.message);
    res.status(500).json({
      status: false,
      creator,
      error: error.message || 'Unexpected error occurred',
    });
  }
});

// Tvshow route
app.get('/api/cine/tvshow', async (req, res) => {
  const q = req.query.url || req.query.link;
  if (!q) {
    return res.status(400).json({
      status: false,
      creator,
      message: '❗ Query parameter "url" or "link" is required.',
    });
  }

  try {
    
    const data = await cine.tvshow(q);
    res.status(200).json({
      status: true,
      creator,
      result: data,
    });

  } catch (error) {
    console.error("❌ Error in /tvshow:", error.message);
    res.status(500).json({
      status: false,
      creator,
      error: error.message || 'Unexpected error occurred',
    });
  }
});

// Episode route
app.get('/api/cine/episode', async (req, res) => {
  const q = req.query.url || req.query.link;
  if (!q) {
    return res.status(400).json({
      status: false,
      creator,
      message: '❗ Query parameter "url" or "link" is required.',
    });
  }

  try {
    
    const data = await cine.episodeDl(q);
    res.status(200).json({
      status: true,
      creator,
      result: data,
    });

  } catch (error) {
    console.error("❌ Error in /episode:", error.message);
    res.status(500).json({
      status: false,
      creator,
      error: error.message || 'Unexpected error occurred',
    });
  }
});

// Download route
app.get('/api/cine/download', async (req, res) => {
  const q = req.query.url || req.query.link;
  if (!q) {
    return res.status(400).json({
      status: false,
      creator,
      message: '❗ Query parameter "url" or "link" is required.',
    });
  }

  try {
    
    const data = await cine.download(q);
    res.status(200).json({
      status: true,
      creator,
      result: data,
    });

  } catch (error) {
    console.error("❌ Error in /download:", error.message);
    res.status(500).json({
      status: false,
      creator,
      error: error.message || 'Unexpected error occurred',
    });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}
