const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

const DEFAULT_MENU_FILE = path.join(__dirname, 'menu.default.json');
const MENU_FILE = path.join(__dirname, 'menu.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure uploads dir exists locally
if (!process.env.VERCEL && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Тільки зображення'));
  },
});

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

// ─── Helper: get backgrounds for templates ───────────────────────────────────

async function getBgUrls() {
  try {
    const menu = await storage.read();
    return (menu.backgrounds || []).map(b => b.url);
  } catch { return []; }
}

// ─── Page routes ─────────────────────────────────────────────────────────────

app.get('/', async (req, res) => res.render('index', { backgrounds: await getBgUrls() }));
app.get('/menu', async (req, res) => res.render('menu', { backgrounds: await getBgUrls() }));

app.get('/drink', async (req, res) => {
  const menu = await storage.read();
  res.render('drink', { menu, backgrounds: (menu.backgrounds || []).map(b => b.url) });
});

app.get('/dishes', async (req, res) => {
  const menu = await storage.read();
  res.render('dishes', { menu, backgrounds: (menu.backgrounds || []).map(b => b.url) });
});

app.get('/promotion', async (req, res) => {
  const menu = await storage.read();
  res.render('promotion', {
    promotions: menu.falseDataPromotion,
    backgrounds: (menu.backgrounds || []).map(b => b.url),
  });
});

app.get('/board', async (req, res) => {
  const menu = await storage.read();
  res.render('board', {
    items: menu.falseDataBeerBoard,
    backgrounds: (menu.backgrounds || []).map(b => b.url),
  });
});

app.get('/admin', (req, res) => res.render('admin', { canUpload: !isVercel }));

// ─── API: menu CRUD ───────────────────────────────────────────────────────────

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

// ─── API: backgrounds ─────────────────────────────────────────────────────────

// Add background by URL
app.post('/api/backgrounds', async (req, res) => {
  try {
    const { url, label } = req.body;
    if (!url) return res.status(400).json({ error: 'URL обовʼязковий' });
    const menu = await storage.read();
    if (!menu.backgrounds) menu.backgrounds = [];
    menu.backgrounds.push({ url, label: label || '' });
    await storage.write(menu);
    res.json(menu.backgrounds);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// Upload background image (local only)
app.post('/api/backgrounds/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не завантажено' });
    const url = '/uploads/' + req.file.filename;
    const label = req.body.label || req.file.originalname;
    const menu = await storage.read();
    if (!menu.backgrounds) menu.backgrounds = [];
    menu.backgrounds.push({ url, label });
    await storage.write(menu);
    res.json(menu.backgrounds);
  } catch (err) { res.status(500).json({ error: err.message || 'Помилка завантаження' }); }
});

// Delete background
app.delete('/api/backgrounds/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const menu = await storage.read();
    if (!menu.backgrounds || idx < 0 || idx >= menu.backgrounds.length)
      return res.status(404).json({ error: 'Не знайдено' });

    // Delete uploaded file from disk if local
    const bg = menu.backgrounds[idx];
    if (!isVercel && bg.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', 'public', bg.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    menu.backgrounds.splice(idx, 1);
    await storage.write(menu);
    res.json(menu.backgrounds);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// ─── Start ───────────────────────────────────────────────────────────────────

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}

module.exports = app;
