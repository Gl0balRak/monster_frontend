import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3006;

const DATA_FILE = path.join(__dirname, '..', 'client', 'data', 'documentation.json');

console.log('Data file path:', DATA_FILE);

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      console.log('Data loaded from file');
      return JSON.parse(data);
    } else {
      console.log('Data file not found:', DATA_FILE);
      return { categories: [] };
    }
  } catch (error) {
    console.error('Error loading data:', error);
    return { categories: [] };
  }
}

// Функция для сохранения данных
function saveData(data) {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Data saved to file:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

let documentationData = loadData();
console.log('Loaded categories:', documentationData.categories.length);

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  console.log('GET /api');
  try {
    const currentData = loadData();
    res.json(currentData);
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api', (req, res) => {
  console.log('POST /api');
  
  try {
    const { categories } = req.body;
    
    console.log('Received data structure:', {
      hasCategories: !!categories,
      categoriesCount: categories ? categories.length : 0
    });
    
    if (categories && Array.isArray(categories)) {
      const newData = { categories };
      
      if (saveData(newData)) {
        documentationData = newData;
        console.log('Saved successfully. Categories:', categories.length);
        res.json({ 
          message: 'Data saved successfully',
          categoriesCount: categories.length 
        });
      } else {
        res.status(500).json({ error: 'Failed to save data to file' });
      }
    } else {
      console.log('Invalid data format:', req.body);
      res.status(400).json({ 
        error: 'Invalid data format. Expected { categories: array }',
        received: req.body
      });
    }
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.get('/api/debug', (req, res) => {
  const fileInfo = {
    dataFile: DATA_FILE,
    fileExists: fs.existsSync(DATA_FILE),
    fileSize: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).size : 0,
    categoriesCount: documentationData.categories.length,
    server: 'running'
  };
  
  res.json(fileInfo);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using data file: ${DATA_FILE}`);
  console.log(`Initial categories: ${documentationData.categories.length}`);
});