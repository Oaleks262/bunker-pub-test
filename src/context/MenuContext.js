import React, { createContext, useContext, useState, useEffect } from 'react';

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => {
        if (!r.ok) throw new Error('Server error');
        return r.json();
      })
      .then((data) => {
        setMenuData(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не вдалося підключитись до сервера. Переконайтесь, що сервер запущено.');
        setLoading(false);
      });
  }, []);

  const addItem = async (categoryKey, item) => {
    const res = await fetch(`/api/menu/${categoryKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const updated = await res.json();
    setMenuData((prev) => ({ ...prev, [categoryKey]: updated }));
  };

  const updateItem = async (categoryKey, index, item) => {
    const res = await fetch(`/api/menu/${categoryKey}/${index}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const updated = await res.json();
    setMenuData((prev) => ({ ...prev, [categoryKey]: updated }));
  };

  const deleteItem = async (categoryKey, index) => {
    const res = await fetch(`/api/menu/${categoryKey}/${index}`, {
      method: 'DELETE',
    });
    const updated = await res.json();
    setMenuData((prev) => ({ ...prev, [categoryKey]: updated }));
  };

  const resetToDefault = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    const data = await res.json();
    setMenuData(data);
  };

  return (
    <MenuContext.Provider value={{ menuData, loading, error, addItem, updateItem, deleteItem, resetToDefault }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);

export default MenuContext;
