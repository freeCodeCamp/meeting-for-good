import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from './fetch.util';

export const isAuthenticated = () => new Promise((resolve) => {
  fetch('/api/user/isAuthenticated', { credentials: 'same-origin' })
    .then(res => checkStatus(res))
    .then(res => parseJSON(res))
    .then((res) => {
      if (res.isAuthenticated === true) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
    .catch(() => resolve(false));
});


export const getCurrentUser = () => new Promise((resolve) => {
  fetch('/api/auth/current', { credentials: 'same-origin' })
    .then(checkStatus)
    .then(parseJSON)
    .then(user => resolve(user))
    .catch(() => resolve(false));
});
