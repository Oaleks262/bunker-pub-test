import React, { useState } from 'react';
import './Admin.css';
import { useMenu } from '../../context/MenuContext';

const ADMIN_PASSWORD = 'bunker-admin';

const CATEGORIES = [
  { key: 'falseDataHotDishes', label: 'Гарячі страви', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataSnacks', label: 'Снеки', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataSauces', label: 'Соуси', fields: ['name', 'volume', 'price'] },
  { key: 'falseDataAlcohol', label: 'Алкогольні напої', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataCoctel', label: 'Коктейлі', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataFireDrink', label: 'Залпові коктейлі', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataVine', label: 'Вино', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataFreeDrink', label: 'Безалкогольні напої', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataShota', label: 'Сети', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataBeer', label: 'Пиво', fields: ['name', 'about', 'volume', 'price'] },
  { key: 'falseDataBeerBoard', label: 'Пивна дошка', fields: ['name', 'volume', 'price'] },
  { key: 'falseDataPromotion', label: 'Акції', fields: ['data', 'promotion'] },
];

const FIELD_LABELS = {
  name: 'Назва',
  about: 'Опис',
  volume: "Об'єм / Вага",
  price: 'Ціна',
  data: 'Дата',
  promotion: 'Текст акції',
};

const emptyItem = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f]: '' }), {});

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', index, formData }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { categoryKey, index }
  const [resetConfirm, setResetConfirm] = useState(false);

  const { menuData, addItem, updateItem, deleteItem, resetToDefault } = useMenu();

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const currentCategory = CATEGORIES.find((c) => c.key === activeCategory);
  const currentItems = menuData[activeCategory] || [];

  const openAdd = () => {
    setModal({ mode: 'add', formData: emptyItem(currentCategory.fields) });
  };

  const openEdit = (index) => {
    setModal({ mode: 'edit', index, formData: { ...currentItems[index] } });
  };

  const closeModal = () => setModal(null);

  const handleFormChange = (field, value) => {
    setModal((prev) => ({ ...prev, formData: { ...prev.formData, [field]: value } }));
  };

  const handleSave = () => {
    if (modal.mode === 'add') {
      addItem(activeCategory, modal.formData);
    } else {
      updateItem(activeCategory, modal.index, modal.formData);
    }
    closeModal();
  };

  const handleDeleteConfirm = () => {
    deleteItem(deleteConfirm.categoryKey, deleteConfirm.index);
    setDeleteConfirm(null);
  };

  const handleResetConfirm = () => {
    resetToDefault();
    setResetConfirm(false);
  };

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <div className="admin-login-logo">BUNKER PUB</div>
          <h2>Адмін панель</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Пароль"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={loginError ? 'input-error' : ''}
              autoFocus
            />
            {loginError && <p className="login-error">Невірний пароль</p>}
            <button type="submit" className="btn-primary">Увійти</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo-text">BUNKER PUB</span>
          <span className="admin-subtitle">Адмін панель</span>
        </div>
        <nav className="admin-nav">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`admin-nav-item ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
              <span className="admin-nav-count">{(menuData[cat.key] || []).length}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="btn-danger-outline" onClick={() => setResetConfirm(true)}>
            Скинути всі дані
          </button>
          <a href="/" className="btn-ghost">← Повернутись на сайт</a>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-main-header">
          <h1>{currentCategory.label}</h1>
          <button className="btn-primary" onClick={openAdd}>
            + Додати позицію
          </button>
        </div>

        {currentItems.length === 0 ? (
          <div className="admin-empty">
            <p>Немає позицій. Додайте першу!</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  {currentCategory.fields.map((f) => (
                    <th key={f}>{FIELD_LABELS[f]}</th>
                  ))}
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="admin-table-num">{index + 1}</td>
                    {currentCategory.fields.map((f) => (
                      <td key={f} className={f === 'about' || f === 'promotion' ? 'admin-td-long' : ''}>
                        {item[f]}
                      </td>
                    ))}
                    <td className="admin-table-actions">
                      <button className="btn-edit" onClick={() => openEdit(index)}>Редагувати</button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm({ categoryKey: activeCategory, index })}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modal.mode === 'add' ? 'Нова позиція' : 'Редагувати позицію'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              {currentCategory.fields.map((field) => (
                <div key={field} className="admin-form-group">
                  <label>{FIELD_LABELS[field]}</label>
                  {field === 'about' || field === 'promotion' ? (
                    <textarea
                      value={modal.formData[field] || ''}
                      onChange={(e) => handleFormChange(field, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={modal.formData[field] || ''}
                      onChange={(e) => handleFormChange(field, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Скасувати</button>
              <button className="btn-primary" onClick={handleSave}>
                {modal.mode === 'add' ? 'Додати' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Підтвердження</h2>
              <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>Ви впевнені, що хочете видалити цю позицію?</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Скасувати</button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>Видалити</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Modal */}
      {resetConfirm && (
        <div className="admin-modal-overlay" onClick={() => setResetConfirm(false)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Скинути всі дані</h2>
              <button className="admin-modal-close" onClick={() => setResetConfirm(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>Всі зміни будуть скасовані, меню повернеться до початкового стану. Продовжити?</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-ghost" onClick={() => setResetConfirm(false)}>Скасувати</button>
              <button className="btn-danger" onClick={handleResetConfirm}>Скинути</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
