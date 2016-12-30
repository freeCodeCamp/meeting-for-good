import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from './fetch.util';

export const isAuthenticated = () => {
  return new Promise((resolve) => {
    fetch('/api/auth/current', { credentials: 'same-origin' })
      .then(checkStatus)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    fetch('/api/auth/current', { credentials: 'same-origin' })
      .then(checkStatus)
      .then(parseJSON)
      .then(user => resolve(user))
      .catch(() => resolve(false));
  });
};

