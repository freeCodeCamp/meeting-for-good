import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';

import { checkStatus, parseJSON } from './fetch.util';

nprogress.configure({ showSpinner: false });

const headerEdit = patches => ({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',
  method: 'PATCH',
  body: JSON.stringify(patches),
});


const editCurUser = async (patches, curUserId) => {
  nprogress.start();
  try {
    const response = await fetch(`/api/user/${curUserId}`, headerEdit(patches));
    checkStatus(response);
    const EditCurUser = await parseJSON(response);
    return EditCurUser;
  } catch (err) {
    console.error('events editEvent', err);
    return null;
  } finally {
    nprogress.done();
  }
};

export default editCurUser;
