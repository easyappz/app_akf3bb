import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';
import './api/axiosInterceptors';

import { Home } from './components/Home';
import { RegisterPage } from './components/Auth/Register';
import { LoginPage } from './components/Auth/Login';
import { ProfilePage } from './components/Profile';
import { AuthProvider } from './context/AuthContext';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <div className="app-root" data-easytag="id1-react/src/App.jsx">
            <header className="app-header">
              <div className="app-logo">Групповой чат</div>
              <nav className="app-nav">
                <Link to="/" className="app-nav-link">
                  Главная
                </Link>
                <Link to="/register" className="app-nav-link">
                  Регистрация
                </Link>
                <Link to="/login" className="app-nav-link">
                  Вход
                </Link>
                <Link to="/profile" className="app-nav-link">
                  Профиль
                </Link>
              </nav>
            </header>

            <main className="app-main">
              <div className="app-main-inner">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </div>
            </main>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
