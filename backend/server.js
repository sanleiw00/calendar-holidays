import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;
const API_KEY = process.env.CALENDARIFIC_API_KEY;

app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Health check - JSON only
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get holidays
app.get('/api/holidays', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const { country, year } = req.query;
    
    if (!country || !year) {
      return res.status(400).json({ error: 'Country and year required' });
    }

    const response = await axios.get('https://calendarific.com/api/v2/holidays', {
      params: {
        api_key: API_KEY,
        country,
        year
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Serving frontend from: ${path.join(__dirname, '../frontend/dist')}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📅 API endpoint: http://localhost:${PORT}/api/holidays`);
});
