import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMessages, sendMessage } from '../../api/chat';

/**
 * Домашняя страница с интерфейсом группового чата.
 */
export const Home = () => {
  const { user, token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [text, setText] = useState('');
  const [sendError, setSendError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isAuthenticated = Boolean(user && token);

  const loadMessages = useCallback(
    async (withLoader) => {
      if (!isAuthenticated) {
        return;
      }

      if (withLoader) {
        setIsLoading(true);
      }

      try {
        const data = await getMessages({ limit: 50 });
        setMessages(Array.isArray(data) ? data : []);
        setLoadError('');
      } catch (error) {
        console.error('Ошибка загрузки сообщений чата', error);
        setLoadError('Не удалось загрузить сообщения. Попробуйте позже.');
      } finally {
        if (withLoader) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      return undefined;
    }

    let isCancelled = false;
    let intervalId = null;

    const init = async () => {
      if (isCancelled) {
        return;
      }
      await loadMessages(true);
      if (isCancelled) {
        return;
      }
      intervalId = window.setInterval(() => {
        loadMessages(false);
      }, 5000);
    };

    init();

    return () => {
      isCancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, loadMessages]);

  const handleSend = useCallback(
    async (event) => {
      event.preventDefault();

      setSendError('');

      const trimmed = text.trim();
      if (!trimmed) {
        setSendError('Введите текст сообщения');
        return;
      }

      try {
        setIsSending(true);
        const created = await sendMessage({ text: trimmed });
        setText('');

        if (created && created.id) {
          setMessages((prev) => [...prev, created]);
        } else {
          loadMessages(false);
        }
      } catch (error) {
        console.error('Ошибка отправки сообщения', error);
        setSendError('Не удалось отправить сообщение. Попробуйте ещё раз.');
      } finally {
        setIsSending(false);
      }
    },
    [text, loadMessages]
  );

  if (!isAuthenticated) {
    return (
      <div
        data-easytag="id1-react/src/components/Home/index.jsx"
        className="page-container"
      >
        <h1 className="page-title">Главная</h1>
        <p className="page-description">
          Для участия в чате необходимо войти в систему.
        </p>

        <div className="chat-auth-actions">
          <Link to="/login" className="button-primary chat-auth-button">
            Войти
          </Link>
          <Link to="/register" className="chat-auth-link">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-easytag="id1-react/src/components/Home/index.jsx"
      className="page-container"
    >
      <h1 className="page-title">Групповой чат</h1>
      <p className="page-description">
        Общайтесь с другими участниками в реальном времени.
      </p>

      <div className="chat-container">
        <div className="chat-messages">
          {isLoading ? (
            <div className="chat-info">Загрузка сообщений...</div>
          ) : null}

          {loadError && !isLoading ? (
            <div className="chat-error">{loadError}</div>
          ) : null}

          {!isLoading && !loadError && messages.length === 0 ? (
            <div className="chat-info">
              Сообщений пока нет. Напишите первое сообщение.
            </div>
          ) : null}

          {!isLoading && !loadError
            ? messages.map((message) => {
                const createdAt = message.created_at
                  ? new Date(message.created_at)
                  : null;
                const timeLabel = createdAt
                  ? createdAt.toLocaleTimeString()
                  : '';

                return (
                  <div key={message.id} className="chat-message">
                    <div className="chat-message-header">
                      <span className="chat-message-author">
                        {message.member_username || 'Неизвестный пользователь'}
                      </span>
                      {timeLabel ? (
                        <span className="chat-message-time">{timeLabel}</span>
                      ) : null}
                    </div>
                    <div className="chat-message-text">{message.text}</div>
                  </div>
                );
              })
            : null}
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Введите сообщение"
          />
          <button
            type="submit"
            className="button-primary chat-send-button"
            disabled={isSending}
          >
            {isSending ? 'Отправка...' : 'Отправить'}
          </button>
        </form>

        {sendError ? <div className="chat-error chat-error-bottom">{sendError}</div> : null}
      </div>
    </div>
  );
};
