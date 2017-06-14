import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import { checkStatus } from './fetch.util';
import { loadOwnerData } from './events';

const fullUrl = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;

const msg = (curUser, event) => ({
  guestName: curUser.name,
  eventName: event.name,
  eventId: event._id,
  eventOwner: event.owner,
  eventOwnerName: curUser.name,
  url: `${fullUrl}/event/${event._id}`,
});

async function sendEmail(ms, endpoint) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify(ms),
  });

  try {
    checkStatus(response);
    return true;
  } catch (err) {
    console.log('sendEmailOwner', err);
    return err;
  } finally {
    nprogress.done();
  }
}
export async function sendEmailOwner(event, curUser, ownerData) {
  const ms = msg(curUser, event);
  ms.to = ownerData.emails[0];
  ms.subject = 'Invite Accepted!!';
  const result = await sendEmail(ms, '/api/email/ownerNotification');
  return result;
}

export async function sendEmailOwnerEdit(event, curUser, ownerData) {
  const ms = msg(curUser, event);
  ms.to = ownerData.emails[0];
  ms.subject = 'A Guest Change their Availabilitys';
  const result = await sendEmail(ms, '/api/email/ownerNotificationForEventEdit');
  return result;
}

export async function sendEmailInvite(guestId, event, curUser) {
  const guestData = await loadOwnerData(guestId);
  const ms = msg(curUser, event);
  ms.to = guestData.emails[0];
  ms.subject = `Invite for ${event.name}!!`;
  const result = await sendEmail(ms, '/api/email/sendInvite');
  return result;
}
