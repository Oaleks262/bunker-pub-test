var ADMIN_PASSWORD = 'bunker-admin';

var CATEGORIES = [
  { key: 'falseDataHotDishes',  label: 'Гарячі страви',      fields: ['name','about','volume','price'] },
  { key: 'falseDataSnacks',     label: 'Снеки',               fields: ['name','about','volume','price'] },
  { key: 'falseDataSauces',     label: 'Соуси',               fields: ['name','volume','price'] },
  { key: 'falseDataAlcohol',    label: 'Алкогольні напої',    fields: ['name','about','volume','price'] },
  { key: 'falseDataCoctel',     label: 'Коктейлі',            fields: ['name','about','volume','price'] },
  { key: 'falseDataFireDrink',  label: 'Залпові коктейлі',    fields: ['name','about','volume','price'] },
  { key: 'falseDataVine',       label: 'Вино',                fields: ['name','about','volume','price'] },
  { key: 'falseDataFreeDrink',  label: 'Безалкогольні напої', fields: ['name','about','volume','price'] },
  { key: 'falseDataShota',      label: 'Сети',                fields: ['name','about','volume','price'] },
  { key: 'falseDataBeer',       label: 'Пиво',                fields: ['name','about','volume','price'] },
  { key: 'falseDataBeerBoard',  label: 'Пивна дошка',         fields: ['name','volume','price'] },
  { key: 'falseDataPromotion',  label: 'Акції',               fields: ['data','promotion'] },
];

var FIELD_LABELS = {
  name: 'Назва', about: 'Опис', volume: "Об'єм / Вага",
  price: 'Ціна', data: 'Дата', promotion: 'Текст акції',
};

var menuData = {};
var activeKey = CATEGORIES[0].key;
var activePage = 'menu'; // 'menu' | 'bg'
var modalMode = 'add';
var modalEditIndex = -1;
var deleteIndex = -1;

// ─── Login ────────────────────────────────────────────────────────────────────

document.getElementById('passwordInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doLogin();
});

function doLogin() {
  if (document.getElementById('passwordInput').value === ADMIN_PASSWORD) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    loadMenu();
  } else {
    document.getElementById('passwordInput').classList.add('input-error');
    document.getElementById('loginError').style.display = 'block';
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

function loadMenu() {
  fetch('/api/menu')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      menuData = data;
      buildSidebar();
      showMenuSection();
    });
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function buildSidebar() {
  var nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';

  // Menu categories
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'admin-nav-item' + (activePage === 'menu' && cat.key === activeKey ? ' active' : '');
    btn.innerHTML = cat.label + '<span class="admin-nav-count">' + (menuData[cat.key] || []).length + '</span>';
    btn.addEventListener('click', function() {
      activePage = 'menu';
      activeKey = cat.key;
      buildSidebar();
      showMenuSection();
    });
    nav.appendChild(btn);
  });

  // Divider
  var divider = document.createElement('div');
  divider.style.cssText = 'height:1px;background:#2e2e2e;margin:8px 0';
  nav.appendChild(divider);

  // Backgrounds
  var bgBtn = document.createElement('button');
  bgBtn.className = 'admin-nav-item' + (activePage === 'bg' ? ' active' : '');
  var bgCount = (menuData.backgrounds || []).length;
  bgBtn.innerHTML = 'Фони сайту<span class="admin-nav-count">' + bgCount + '</span>';
  bgBtn.addEventListener('click', function() {
    activePage = 'bg';
    buildSidebar();
    showBgSection();
  });
  nav.appendChild(bgBtn);
}

// ─── Menu section ─────────────────────────────────────────────────────────────

function showMenuSection() {
  document.getElementById('menuSection').style.display = '';
  document.getElementById('bgSection').style.display = 'none';
  renderCategory(activeKey);
}

function renderCategory(key) {
  var cat = CATEGORIES.find(function(c) { return c.key === key; });
  var items = menuData[key] || [];

  document.getElementById('categoryTitle').textContent = cat.label;
  var head = document.getElementById('tableHead');
  var body = document.getElementById('tableBody');
  var empty = document.getElementById('emptyMsg');
  var table = document.getElementById('menuTable');

  head.innerHTML = '';
  body.innerHTML = '';

  if (items.length === 0) {
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  table.style.display = '';

  var headRow = document.createElement('tr');
  headRow.innerHTML = '<th>#</th>' +
    cat.fields.map(function(f) { return '<th>' + FIELD_LABELS[f] + '</th>'; }).join('') +
    '<th>Дії</th>';
  head.appendChild(headRow);

  items.forEach(function(item, i) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td class="admin-table-num">' + (i + 1) + '</td>' +
      cat.fields.map(function(f) {
        var cls = (f === 'about' || f === 'promotion') ? ' class="admin-td-long"' : '';
        return '<td' + cls + '>' + (item[f] || '') + '</td>';
      }).join('') +
      '<td class="admin-table-actions">' +
        '<button class="btn-edit" onclick="openEditModal(' + i + ')">Редагувати</button>' +
        '<button class="btn-delete" onclick="openDeleteModal(' + i + ')">Видалити</button>' +
      '</td>';
    body.appendChild(tr);
  });
}

// ─── Add/Edit modal ───────────────────────────────────────────────────────────

function openAddModal() {
  modalMode = 'add';
  modalEditIndex = -1;
  document.getElementById('modalTitle').textContent = 'Нова позиція';
  buildModalForm({});
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(index) {
  modalMode = 'edit';
  modalEditIndex = index;
  document.getElementById('modalTitle').textContent = 'Редагувати позицію';
  buildModalForm(menuData[activeKey][index]);
  document.getElementById('modalOverlay').classList.add('open');
}

function buildModalForm(item) {
  var cat = CATEGORIES.find(function(c) { return c.key === activeKey; });
  var body = document.getElementById('modalBody');
  body.innerHTML = '';
  cat.fields.forEach(function(field) {
    var group = document.createElement('div');
    group.className = 'admin-form-group';
    var label = document.createElement('label');
    label.textContent = FIELD_LABELS[field];
    var input = (field === 'about' || field === 'promotion')
      ? Object.assign(document.createElement('textarea'), { rows: 3 })
      : Object.assign(document.createElement('input'), { type: 'text' });
    input.id = 'field_' + field;
    input.value = item[field] || '';
    group.appendChild(label);
    group.appendChild(input);
    body.appendChild(group);
  });
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

function saveModal() {
  var cat = CATEGORIES.find(function(c) { return c.key === activeKey; });
  var item = {};
  cat.fields.forEach(function(f) {
    item[f] = document.getElementById('field_' + f).value;
  });

  var url = modalMode === 'add'
    ? '/api/menu/' + activeKey
    : '/api/menu/' + activeKey + '/' + modalEditIndex;

  fetch(url, {
    method: modalMode === 'add' ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
    .then(function(r) { return r.json(); })
    .then(function(updated) {
      menuData[activeKey] = updated;
      closeModal();
      buildSidebar();
      renderCategory(activeKey);
    });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function openDeleteModal(index) {
  deleteIndex = index;
  document.getElementById('deleteOverlay').classList.add('open');
}

function closeDelete() { document.getElementById('deleteOverlay').classList.remove('open'); }

function doDelete() {
  fetch('/api/menu/' + activeKey + '/' + deleteIndex, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function(updated) {
      menuData[activeKey] = updated;
      closeDelete();
      buildSidebar();
      renderCategory(activeKey);
    });
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function confirmReset() { document.getElementById('resetOverlay').classList.add('open'); }
function closeReset() { document.getElementById('resetOverlay').classList.remove('open'); }

function doReset() {
  fetch('/api/reset', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      menuData = data;
      closeReset();
      buildSidebar();
      if (activePage === 'bg') showBgSection();
      else renderCategory(activeKey);
    });
}

// ─── Backgrounds section ──────────────────────────────────────────────────────

function showBgSection() {
  document.getElementById('menuSection').style.display = 'none';
  document.getElementById('bgSection').style.display = '';
  renderBgList();
}

function renderBgList() {
  var list = menuData.backgrounds || [];
  var container = document.getElementById('bgList');
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<p class="admin-empty" style="display:block">Немає фонів. Додайте перший!</p>';
    return;
  }

  list.forEach(function(bg, i) {
    var card = document.createElement('div');
    card.className = 'bg-card';
    card.innerHTML =
      '<div class="bg-card-thumb" style="background-image:url(' + bg.url + ')"></div>' +
      '<div class="bg-card-info">' +
        '<span class="bg-card-label">' + (bg.label || bg.url) + '</span>' +
        '<span class="bg-card-url">' + bg.url + '</span>' +
      '</div>' +
      '<button class="btn-delete" onclick="deleteBg(' + i + ')">Видалити</button>';
    container.appendChild(card);
  });
}

function addBgUrl() {
  var url = document.getElementById('bgUrl').value.trim();
  var label = document.getElementById('bgLabel').value.trim();
  if (!url) return;

  fetch('/api/backgrounds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url, label: label }),
  })
    .then(function(r) { return r.json(); })
    .then(function(updated) {
      menuData.backgrounds = updated;
      document.getElementById('bgUrl').value = '';
      document.getElementById('bgLabel').value = '';
      buildSidebar();
      renderBgList();
    });
}

function uploadBgFile() {
  var fileInput = document.getElementById('bgFile');
  var label = document.getElementById('bgFileLabel').value.trim();
  if (!fileInput.files.length) return;

  var formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('label', label || fileInput.files[0].name);

  fetch('/api/backgrounds/upload', { method: 'POST', body: formData })
    .then(function(r) { return r.json(); })
    .then(function(updated) {
      if (updated.error) { alert(updated.error); return; }
      menuData.backgrounds = updated;
      fileInput.value = '';
      document.getElementById('bgFileLabel').value = '';
      buildSidebar();
      renderBgList();
    });
}

function deleteBg(index) {
  if (!confirm('Видалити цей фон?')) return;
  fetch('/api/backgrounds/' + index, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function(updated) {
      menuData.backgrounds = updated;
      buildSidebar();
      renderBgList();
    });
}
