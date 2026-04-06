const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const DEFAULT_MENU_FILE = path.join(__dirname, 'menu.default.json');
const MENU_FILE = path.join(__dirname, 'menu.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cors());
app.use(express.json());

// ─── Storage ─────────────────────────────────────────────────────────────────

const isVercel = Boolean(process.env.KV_REST_API_URL);

const storage = isVercel
  ? (() => {
      const { kv } = require('@vercel/kv');
      const KEY = 'bunker_menu';
      return {
        read: async () => {
          const data = await kv.get(KEY);
          if (!data) {
            const def = JSON.parse(fs.readFileSync(DEFAULT_MENU_FILE, 'utf8'));
            await kv.set(KEY, def);
            return def;
          }
          return data;
        },
        write: async (data) => kv.set(KEY, data),
        reset: async () => {
          const def = JSON.parse(fs.readFileSync(DEFAULT_MENU_FILE, 'utf8'));
          await kv.set(KEY, def);
          return def;
        },
      };
    })()
  : {
      read: async () => JSON.parse(fs.readFileSync(MENU_FILE, 'utf8')),
      write: async (data) => fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2)),
      reset: async () => {
        const raw = fs.readFileSync(DEFAULT_MENU_FILE, 'utf8');
        fs.writeFileSync(MENU_FILE, raw);
        return JSON.parse(raw);
      },
    };

// ─── Page routes ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.render('index'));
app.get('/menu', (req, res) => res.render('menu'));

app.get('/drink', async (req, res) => {
  const menu = await storage.read();
  res.render('drink', { menu });
});

app.get('/dishes', async (req, res) => {
  const menu = await storage.read();
  res.render('dishes', { menu });
});

app.get('/promotion', async (req, res) => {
  const menu = await storage.read();
  res.render('promotion', { promotions: menu.falseDataPromotion });
});

app.get('/board', async (req, res) => {
  const menu = await storage.read();
  res.render('board', { items: menu.falseDataBeerBoard });
});

app.get('/admin', (req, res) => res.render('admin'));

// ─── API routes ──────────────────────────────────────────────────────────────

app.get('/api/menu', async (req, res) => {
  try { res.json(await storage.read()); }
  catch { res.status(500).json({ error: 'Не вдалося прочитати меню' }); }
});

app.post('/api/reset', async (req, res) => {
  try { res.json(await storage.reset()); }
  catch { res.status(500).json({ error: 'Не вдалося скинути дані' }); }
});

app.post('/api/menu/:categoryKey', async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const menu = await storage.read();
    if (!menu[categoryKey]) return res.status(404).json({ error: 'Категорію не знайдено' });
    menu[categoryKey].push(req.body);
    await storage.write(menu);
    res.json(menu[categoryKey]);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

app.put('/api/menu/:categoryKey/:index', async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const idx = parseInt(req.params.index, 10);
    const menu = await storage.read();
    if (!menu[categoryKey] || idx < 0 || idx >= menu[categoryKey].length)
      return res.status(404).json({ error: 'Не знайдено' });
    menu[categoryKey][idx] = req.body;
    await storage.write(menu);
    res.json(menu[categoryKey]);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

app.delete('/api/menu/:categoryKey/:index', async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const idx = parseInt(req.params.index, 10);
    const menu = await storage.read();
    if (!menu[categoryKey] || idx < 0 || idx >= menu[categoryKey].length)
      return res.status(404).json({ error: 'Не знайдено' });
    menu[categoryKey].splice(idx, 1);
    await storage.write(menu);
    res.json(menu[categoryKey]);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// ─── Start ───────────────────────────────────────────────────────────────────

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}

module.exports = app;
