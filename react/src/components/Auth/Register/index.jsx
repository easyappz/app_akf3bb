import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const getErrorMessage = useCallback((error) => {
    let message = 'Произошла ошибка. Попробуйте ещё раз.';

    if (error && error.response && error.response.data) {
      const data = error.response.data;

      if (typeof data === 'string') {
        message = data;
      } else if (data.detail) {
        message = data.detail;
      } else if (typeof data === 'object') {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const value = data[firstKey];
          if (Array.isArray(value) && value.length > 0) {
            message = String(value[0]);
          } else {
            message = String(value);
          }
        }
      }
    } else if (error && error.message) {
      message = error.message;
    }

    return message;
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      setUsernameError('');
      setPasswordError('');
      setFormError('');

      let hasError = false;

      if (!username) {
        setUsernameError('Введите имя пользователя');
        hasError = true;
      }

      if (!password) {
        setPasswordError('Введите пароль');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      try {
        setIsSubmitting(true);
        await register({ username, password });
        navigate('/');
      } catch (error) {
        const message = getErrorMessage(error);
        setFormError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [username, password, register, navigate, getErrorMessage]
  );

  return (
    <div
      data-easytag="id1-react/src/components/Auth/Register/index.jsx"
      className="page-container"
    >
      <h1 className="page-title">Регистрация</h1>
      <p className="page-description">
        Создайте аккаунт, указав имя пользователя и пароль.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="register-username" className="form-label">
            Имя пользователя
          </label>
          <input
            id="register-username"
            type="text"
            className="form-input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Введите имя пользователя"
            autoComplete="username"
          />
          {usernameError ? (
            <div className="form-error">{usernameError}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="register-password" className="form-label">
            Пароль
          </label>
          <input
            id="register-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            autoComplete="new-password"
          />
          {passwordError ? (
            <div className="form-error">{passwordError}</div>
          ) : null}
        </div>

        {formError ? <div className="global-error">{formError}</div> : null}

        <div className="form-actions">
          <button
            type="submit"
            className="button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </div>
      </form>
    </div>
  );
};
