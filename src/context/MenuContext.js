import React, { createContext, useContext, useState } from 'react';
import DataMenu from '../DataMenu/DataMenu';

const STORAGE_KEY = 'bunker_menu_data';

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [menuData, setMenuData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { ...DataMenu };
    } catch {
      return { ...DataMenu };
    }
  });

  const persist = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setMenuData(data);
  };

  const addItem = (categoryKey, item) => {
    const updated = { ...menuData, [categoryKey]: [...menuData[categoryKey], item] };
    persist(updated);
  };

  const updateItem = (categoryKey, index, item) => {
    const updated = { ...menuData };
    updated[categoryKey] = [...updated[categoryKey]];
    updated[categoryKey][index] = item;
    persist(updated);
  };

  const deleteItem = (categoryKey, index) => {
    const updated = { ...menuData };
    updated[categoryKey] = updated[categoryKey].filter((_, i) => i !== index);
    persist(updated);
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMenuData({ ...DataMenu });
  };

  return (
    <MenuContext.Provider value={{ menuData, addItem, updateItem, deleteItem, resetToDefault }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);

export default MenuContext;
