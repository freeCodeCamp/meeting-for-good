import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import { checkStatus } from './fetch.util';
import { loadOwnerData } from './events';

export async function sendEmailOwner(event, curUser, ownerData) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const { name } = curUser;
  const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
  const msg = {
    guestName: name,
    eventName: event.name,
    eventId: event._id,
    eventOwner: event.owner,
    url: `${fullUrl}/event/${event._id}`,
    to: ownerData.emails[0],
    subject: 'Invite Accepted!!',
  };
  const response = await fetch('/api/email/ownerNotification', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify(msg),
  });

  try {
    checkStatus(response);
    return true;
  } catch (err) {
    console.log('sendEmailOwner', err);
    return false;
  } finally {
    nprogress.done();
  }
}
export async function sendEmailOwnerEdit(event, curUser, ownerData) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const { name } = curUser;
  const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
  const msg = {
    guestName: name,
    eventName: event.name,
    eventId: event._id,
    eventOwner: event.owner,
    url: `${fullUrl}/event/${event._id}`,
    to: ownerData.emails[0],
    subject: 'A Guest Change their Availabilitys',
  };
  const response = await fetch('/api/email/ownerNotificationForEventEdit', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify(msg),
  });

  try {
    checkStatus(response);
    return true;
  } catch (err) {
    console.log('sendEmailOwnerEdit', err);
    return false;
  } finally {
    nprogress.done();
  }
}


export async function sendEmailInvite(guestId, event, curUser) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
  const guestData = await loadOwnerData(guestId);
  const msg = {
    guestName: guestData.name,
    eventName: event.name,
    eventId: event._id,
    eventOwner: event.owner,
    eventOwnerName: curUser.name,
    url: `${fullUrl}/event/${event._id}`,
    to: guestData.emails[0],
    subject: `Invite for ${event.name}!!`,
  };
  const response = await fetch('/api/email/sendInvite', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify(msg),
  });

  try {
    checkStatus(response);
    return true;
  } catch (err) {
    console.log('sendEmailOwner', err);
    return false;
  } finally {
    nprogress.done();
  }
}
