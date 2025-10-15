import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3006;

const DATA_FILE = path.join(__dirname, '..', 'data', 'documentation.json');

app.use(cors());
app.use(express.json());

const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    const defaultData = { categories: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  } catch (error) {
    console.error('Error loading data:', error);
    return { categories: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

app.get('/api/documentation', (req, res) => {
  try {
    const data = loadData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api/documentation', (req, res) => {
  try {
    const { categories } = req.body;
    
    if (categories && Array.isArray(categories)) {
      if (saveData({ categories })) {
        res.json({ message: 'Data saved successfully' });
      } else {
        res.status(500).json({ error: 'Failed to save data' });
      }
    } else {
      res.status(400).json({ error: 'Invalid data format' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Documentation API running on http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
  });
}

export default app;