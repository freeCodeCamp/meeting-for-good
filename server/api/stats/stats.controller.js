'use strict';

import Events from '../events/events.model';

const handleError = (res, statusCode) => {
  statusCode = statusCode || 500;
  return (err) => {
    console.log('handleError at event.controler', err);
    res.status(statusCode).send(err);
  };
};

// Calculate application statistics
export const getStats = (req, res) => {
  let nbrUsers = 0;
  let nbrEvents = 0;
  let nbrActiveEvents = 0;
  let nbrParticipants = 0;
  const usersMap = {};

  Events.find({}, (err, events) => {
    nbrEvents = events.length;
    events.forEach((event) => {
      if (event.active) {
        nbrActiveEvents += 1;
      }
      nbrParticipants += event.participants.length;
      usersMap[event.owner] = true;
    });
    nbrUsers = Object.keys(usersMap).length;

    const stats = {
      users: nbrUsers,
      events: nbrEvents,
      activeEvents: nbrActiveEvents,
      participants: nbrParticipants,
    };
    return res.status(200).json(stats);
  });
};

