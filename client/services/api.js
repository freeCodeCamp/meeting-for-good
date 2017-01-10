import 'isomorphic-fetch';
import { checkStatus, parseJSON } from '../util/fetch.util';
import { Schema, normalize } from 'normalize';

const callApi = (endpoint, schema) => {
  return fetch(endpoint)
    .then(checkStatus)
    .then(parseJSON)
    .then(json => normalize(json, schema))
    .then(
      response => ({ response }),
      error => ({ error: error.message || 'Something bad happened.' }),
  );
};
