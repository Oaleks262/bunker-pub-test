const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const DEFAULT_MENU_FILE = path.join(__dirname, 'menu.default.json');
const MENU_FILE = path.join(__dirname, 'menu.json');

app.use(cors());
app.use(express.json());

// ─── Storage: Vercel KV у продакшені, файлова система локально ───────────────

const isVercel = Boolean(process.env.KV_REST_API_URL);

const storage = isVercel
  ? (() => {
      const { kv } = require('@vercel/kv');
      const KV_KEY = 'bunker_menu';
      return {
        read: async () => {
          const data = await kv.get(KV_KEY);
          if (!data) {
            const defaultData = JSON.parse(fs.readFileSync(DEFAULT_MENU_FILE, 'utf8'));
            await kv.set(KV_KEY, defaultData);
            return defaultData;
          }
          return data;
        },
        write: async (data) => {
          await kv.set(KV_KEY, data);
        },
        reset: async () => {
          const defaultData = JSON.parse(fs.readFileSync(DEFAULT_MENU_FILE, 'utf8'));
          await kv.set(KV_KEY, defaultData);
          return defaultData;
        },
      };
    })()
  : {
      read: async () => JSON.parse(fs.readFileSync(MENU_FILE, 'utf8')),
      write: async (data) => fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2), 'utf8'),
      reset: async () => {
        const defaultData = fs.readFileSync(DEFAULT_MENU_FILE, 'utf8');
        fs.writeFileSync(MENU_FILE, defaultData);
        return JSON.parse(defaultData);
      },
    };

// ─── API routes ───────────────────────────────────────────────────────────────

// GET all menu data
app.get('/api/menu', async (req, res) => {
  try {
    res.json(await storage.read());
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося прочитати меню' });
  }
});

// POST reset to defaults
app.post('/api/reset', async (req, res) => {
  try {
    res.json(await storage.reset());
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося скинути дані' });
  }
});

// POST add item to category
app.post('/api/menu/:categoryKey', async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const menu = await storage.read();
    if (!menu[categoryKey]) return res.status(404).json({ error: 'Категорію не знайдено' });
    menu[categoryKey].push(req.body);
    await storage.write(menu);
    res.json(menu[categoryKey]);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося додати позицію' });
  }
});

// PUT update item
app.put('/api/menu/:categoryKey/:index', async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const index = parseInt(req.params.index, 10);
    const menu = await storage.read();
    if (!menu[categoryKey]) return res.status(404).json({ error: 'Категорію не знайдено' });
    if (index < 0 || index >= menu[categoryKey].length) return res.status(404).json({ error: 'Позицію не знайдено' });
    menu[categoryKey][index] = req.body;
    await storage.write(menu);
    res.json(menu[categoryKey]);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося оновити позицію' });
  }
});

// DELETE item
app.delete('/api/menu/:categoryKey/:index', async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const index = parseInt(req.params.index, 10);
    const menu = await storage.read();
    if (!menu[categoryKey]) return res.status(404).json({ error: 'Категорію не знайдено' });
    if (index < 0 || index >= menu[categoryKey].length) return res.status(404).json({ error: 'Позицію не знайдено' });
    menu[categoryKey].splice(index, 1);
    await storage.write(menu);
    res.json(menu[categoryKey]);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося видалити позицію' });
  }
});

// ─── Static React build (тільки локально, на Vercel це не потрібно) ──────────
if (process.env.NODE_ENV === 'production' && !isVercel) {
  app.use(express.static(path.join(__dirname, '..', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

// ─── Запуск локально (не на Vercel) ──────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
  });
}

// Vercel потребує export
module.exports = app;
