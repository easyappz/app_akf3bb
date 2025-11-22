import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/profile';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  const loadProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      const status = err && err.response ? err.response.status : null;
      if (status === 401) {
        try {
          await logout();
        } catch (logoutError) {
          console.error('Ошибка при выходе из системы', logoutError);
        }
        navigate('/login');
      } else {
        console.error('Ошибка загрузки профиля', err);
        setError('Не удалось загрузить профиль. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token, loadProfile]);

  const formatDateTime = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    try {
      return date.toLocaleString('ru-RU');
    } catch (err) {
      return date.toString();
    }
  };

  const usernameToShow = profile && profile.username ? profile.username : user ? user.username : '';
  const createdAtToShow = profile && profile.created_at ? profile.created_at : user ? user.created_at : '';

  return (
    <div
      data-easytag="id1-react/src/components/Profile/index.jsx"
      className="page-container"
    >
      <h1 className="page-title">Профиль пользователя</h1>
      <p className="page-description">
        Здесь отображается актуальная информация о вашем аккаунте.
      </p>

      <div className="profile-card">
        {isLoading ? <div className="profile-info">Загрузка профиля...</div> : null}
        {error ? <div className="profile-error">{error}</div> : null}

        {!isLoading && !error ? (
          <>
            <div className="profile-row">
              <span className="profile-label">Имя пользователя</span>
              <span className="profile-value">{usernameToShow || '-'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Дата регистрации</span>
              <span className="profile-value">{formatDateTime(createdAtToShow)}</span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
