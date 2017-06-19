
import { loadEvent, loadOwnerData } from '../util/events';
import { sendEmailOwner, sendEmailOwnerEdit } from '../util/emails';


const handleLoadEvent = async (id, events) => {
  const event = events.filter(event => event._id.toString() === id.toString());
  if (event.length === 0) {
    const event = await loadEvent(id);
    if (event === null) {
      this._addNotification('Error!!', 'I can\'t load event, please try again latter', 'error', 8);
      return false;
    }
    return event;
  }
  return event[0];
};


const handleEmailOwner = async (event, curUser, eventEdited = false) => {
  const ownerData = await loadOwnerData(event.owner);
  if (ownerData !== null) {
    const response = (eventEdited) ?
      await sendEmailOwner(event, curUser, ownerData)
      : await sendEmailOwnerEdit(event, curUser, ownerData);

    if (response) {
      return true;
    }
    return false;
  }
};


export { handleEmailOwner, handleLoadEvent };
