const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const MENU_FILE = path.join(__dirname, 'menu.json');
const DEFAULT_MENU_FILE = path.join(__dirname, 'menu.default.json');

app.use(cors());
app.use(express.json());

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
}

const readMenu = () => {
  const data = fs.readFileSync(MENU_FILE, 'utf8');
  return JSON.parse(data);
};

const writeMenu = (data) => {
  fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// GET all menu data
app.get('/api/menu', (req, res) => {
  try {
    res.json(readMenu());
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося прочитати меню' });
  }
});

// POST reset to defaults — must be before /:categoryKey
app.post('/api/reset', (req, res) => {
  try {
    const defaultData = fs.readFileSync(DEFAULT_MENU_FILE, 'utf8');
    fs.writeFileSync(MENU_FILE, defaultData);
    res.json(JSON.parse(defaultData));
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося скинути дані' });
  }
});

// POST add item to category
app.post('/api/menu/:categoryKey', (req, res) => {
  try {
    const { categoryKey } = req.params;
    const item = req.body;
    const menu = readMenu();
    if (!menu[categoryKey]) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }
    menu[categoryKey].push(item);
    writeMenu(menu);
    res.json(menu[categoryKey]);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося додати позицію' });
  }
});

// PUT update item in category
app.put('/api/menu/:categoryKey/:index', (req, res) => {
  try {
    const { categoryKey } = req.params;
    const index = parseInt(req.params.index, 10);
    const item = req.body;
    const menu = readMenu();
    if (!menu[categoryKey]) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }
    if (index < 0 || index >= menu[categoryKey].length) {
      return res.status(404).json({ error: 'Позицію не знайдено' });
    }
    menu[categoryKey][index] = item;
    writeMenu(menu);
    res.json(menu[categoryKey]);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося оновити позицію' });
  }
});

// DELETE item from category
app.delete('/api/menu/:categoryKey/:index', (req, res) => {
  try {
    const { categoryKey } = req.params;
    const index = parseInt(req.params.index, 10);
    const menu = readMenu();
    if (!menu[categoryKey]) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }
    if (index < 0 || index >= menu[categoryKey].length) {
      return res.status(404).json({ error: 'Позицію не знайдено' });
    }
    menu[categoryKey].splice(index, 1);
    writeMenu(menu);
    res.json(menu[categoryKey]);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося видалити позицію' });
  }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
