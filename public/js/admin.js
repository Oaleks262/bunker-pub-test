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
var modalMode = 'add';
var modalEditIndex = -1;
var deleteIndex = -1;

// ─── Login ────────────────────────────────────────────────────────────────────

document.getElementById('passwordInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doLogin();
});

function doLogin() {
  var val = document.getElementById('passwordInput').value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    loadMenu();
  } else {
    document.getElementById('passwordInput').classList.add('input-error');
    document.getElementById('loginError').style.display = 'block';
  }
}

// ─── Load menu ────────────────────────────────────────────────────────────────

function loadMenu() {
  fetch('/api/menu')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      menuData = data;
      buildSidebar();
      renderCategory(activeKey);
    });
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function buildSidebar() {
  var nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'admin-nav-item' + (cat.key === activeKey ? ' active' : '');
    btn.innerHTML =
      cat.label +
      '<span class="admin-nav-count">' + (menuData[cat.key] || []).length + '</span>';
    btn.addEventListener('click', function() {
      activeKey = cat.key;
      buildSidebar();
      renderCategory(activeKey);
    });
    nav.appendChild(btn);
  });
}

// ─── Render table ─────────────────────────────────────────────────────────────

function renderCategory(key) {
  var cat = CATEGORIES.find(function(c) { return c.key === key; });
  var items = menuData[key] || [];

  document.getElementById('categoryTitle').textContent = cat.label;

  var head = document.getElementById('tableHead');
  var body = document.getElementById('tableBody');
  var empty = document.getElementById('emptyMsg');

  head.innerHTML = '';
  body.innerHTML = '';

  if (items.length === 0) {
    empty.style.display = 'block';
    document.querySelector('.admin-table').style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  document.querySelector('.admin-table').style.display = '';

  var headRow = document.createElement('tr');
  headRow.innerHTML = '<th>#</th>' +
    cat.fields.map(function(f) { return '<th>' + FIELD_LABELS[f] + '</th>'; }).join('') +
    '<th>Дії</th>';
  head.appendChild(headRow);

  items.forEach(function(item, i) {
    var tr = document.createElement('tr');
    var cells = '<td class="admin-table-num">' + (i + 1) + '</td>' +
      cat.fields.map(function(f) {
        var cls = (f === 'about' || f === 'promotion') ? ' class="admin-td-long"' : '';
        return '<td' + cls + '>' + (item[f] || '') + '</td>';
      }).join('') +
      '<td class="admin-table-actions">' +
        '<button class="btn-edit" onclick="openEditModal(' + i + ')">Редагувати</button>' +
        '<button class="btn-delete" onclick="openDeleteModal(' + i + ')">Видалити</button>' +
      '</td>';
    tr.innerHTML = cells;
    body.appendChild(tr);
  });
}

// ─── Add / Edit modal ─────────────────────────────────────────────────────────

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
    var input;
    if (field === 'about' || field === 'promotion') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.id = 'field_' + field;
    input.value = item[field] || '';
    group.appendChild(label);
    group.appendChild(input);
    body.appendChild(group);
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function saveModal() {
  var cat = CATEGORIES.find(function(c) { return c.key === activeKey; });
  var item = {};
  cat.fields.forEach(function(field) {
    item[field] = document.getElementById('field_' + field).value;
  });

  var url, method;
  if (modalMode === 'add') {
    url = '/api/menu/' + activeKey;
    method = 'POST';
  } else {
    url = '/api/menu/' + activeKey + '/' + modalEditIndex;
    method = 'PUT';
  }

  fetch(url, {
    method: method,
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

function closeDelete() {
  document.getElementById('deleteOverlay').classList.remove('open');
}

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

function confirmReset() {
  document.getElementById('resetOverlay').classList.add('open');
}

function closeReset() {
  document.getElementById('resetOverlay').classList.remove('open');
}

function doReset() {
  fetch('/api/reset', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      menuData = data;
      closeReset();
      buildSidebar();
      renderCategory(activeKey);
    });
}
