import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Menu from './pages/menu/Menu';
import MenuPage from './pages/menu-page/MenuPage';
import Drink from './pages/drink/Drink';
import Dishes from './pages/dishes/Dishes';
import Promotion from './pages/promotion/Promotion';
import Madeboard from './pages/madeBoard/Madeboard';
import Admin from './pages/admin/Admin';
import { MenuProvider, useMenu } from './context/MenuContext';

const AppRoutes = () => {
  const { loading, error } = useMenu();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#141414', color: '#aaa', fontSize: '18px', fontFamily: 'Cuprum, sans-serif' }}>
        Завантаження меню...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#141414', color: '#e07a7a', fontSize: '16px', fontFamily: 'Cuprum, sans-serif', gap: '12px', padding: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>⚠️</span>
        <p style={{ margin: 0 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '8px', background: '#db1f1f', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 24px', fontSize: '15px', cursor: 'pointer', fontFamily: 'Cuprum, sans-serif' }}>
          Спробувати ще раз
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/promotion" element={<Promotion />} />
        <Route path="/drink" element={<Drink />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/board" element={<Madeboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <MenuProvider>
      <AppRoutes />
    </MenuProvider>
  );
}

export default App;
