import instance from './axios';

export async function getMessages(options = {}) {
  const params = {};

  if (options.limit) {
    params.limit = options.limit;
  }

  const response = await instance.get('/api/chat/messages/', {
    params,
  });

  return response.data;
}

export async function sendMessage({ text }) {
  const response = await instance.post('/api/chat/messages/', {
    text,
  });

  return response.data;
}
