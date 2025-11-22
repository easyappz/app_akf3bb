import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from '../api/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  isInitialized: false,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
});

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = window.localStorage.getItem(AUTH_USER_KEY);

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Не удалось прочитать сохранённого пользователя', error);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка инициализации авторизации', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (nextToken) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
      } else {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      }

      if (nextUser) {
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      } else {
        window.localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  const handleLogin = useCallback(
    async ({ username, password }) => {
      const data = await loginApi({ username, password });

      const nextToken = data.token || null;
      const nextUser = {
        id: data.id,
        username: data.username,
        created_at: data.created_at,
      };

      setToken(nextToken);
      setUser(nextUser);
      persistAuth(nextToken, nextUser);

      return nextUser;
    },
    [persistAuth]
  );

  const handleRegister = useCallback(
    async ({ username, password }) => {
      const data = await registerApi({ username, password });

      const nextToken = data.token || null;
      const nextUser = {
        id: data.id,
        username: data.username,
        created_at: data.created_at,
      };

      setToken(nextToken);
      setUser(nextUser);
      persistAuth(nextToken, nextUser);

      return nextUser;
    },
    [persistAuth]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Ошибка при выходе из системы', error);
    }

    setToken(null);
    setUser(null);
    persistAuth(null, null);
  }, [persistAuth]);

  const value = {
    user,
    token,
    isInitialized,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
