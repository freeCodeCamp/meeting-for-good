export const eventAllParticipIds = event => event.participants.map(
    participant => participant.userId._id);


export const datesToDatesObject = event => event.dates.map(({ fromDate, toDate }) =>
  ({
    fromDate: new Date(fromDate),
    toDate: new Date(toDate),
  }));

export const isCurParticip = (curUser, event) => event.participants.find(participant =>
  participant.userId._id === curUser._id,
);
