import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from './fetch.util';

export const isAuthenticated = async () => {
  try {
    let response = await fetch('/api/user/isAuthenticated', { credentials: 'same-origin' });
    response = await checkStatus(response);
    const isAuth = await parseJSON(response);
    return isAuth.isAuthenticated;
  } catch (err) {
    console.error('error at auth.js isAuthenticated', err);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    let response = await fetch('/api/auth/current', { credentials: 'same-origin' });
    response = await checkStatus(response);
    return parseJSON(response);
  } catch (err) {
    console.error(' at auth.js getCurrentUser', err);
    return err;
  }
};
