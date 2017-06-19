import { browserHistory } from 'react-router';

const handleEventLinkClick = (id) => {
  browserHistory.push(`/event/${id}`);
};

const quantOwnerNotNotified = (events, curUser) => {
  let quantOwnerNotNotified = 0;
  if (events.length > 0) {
    events.forEach((event) => {
      event.participants.forEach((participant) => {
        if (
          participant.userId._id.toString() !== curUser._id
          && participant.ownerNotified === false
          && participant.status > 1
          && event.owner.toString() === curUser._id
        ) {
          quantOwnerNotNotified += 1;
        }
      });
    });
  }
  return quantOwnerNotNotified;
};

export { handleEventLinkClick, quantOwnerNotNotified };
