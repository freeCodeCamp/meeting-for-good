import Meeting from '../models/meeting.js';

Meeting.find({}).remove(() => {
  Meeting.create([{
    name: 'Event 1',
    dates: [{
      from: new Date('19 April 2016'),
      to: new Date('2 May 2016'),
    }],
    participants: [
      {
        name: 'Aniruddh Agarwal',
        avatar: 'https://avatars1.githubusercontent.com/u/5279150?v=3&s=460',
      },
      {
        name: 'Akira Laine',
        avatar: 'https://avatars0.githubusercontent.com/u/11958359?v=3&s=460',
      },
      {
        name: 'Michael Johnson',
        avatar: 'https://avatars0.githubusercontent.com/u/9578097?v=3&s=460',
      },
    ],
    uid: "8fH7qU"
  }, {
    name: 'Event 2',
    dates: [{
      from: new Date('12 April 2016'),
      to: new Date('1 May 2016'),
    }],
    participants: [
      {
        name: 'Aniruddh Agarwal',
        avatar: 'https://avatars1.githubusercontent.com/u/5279150?v=3&s=460',
      },
      {
        name: 'Akira Laine',
        avatar: 'https://avatars0.githubusercontent.com/u/11958359?v=3&s=460',
      },
      {
        name: 'Michael Johnson',
        avatar: 'https://avatars0.githubusercontent.com/u/9578097?v=3&s=460',
      },
    ],
    uid: "23gHUU"
  }, {
    name: 'Event 3',
    dates: [{
      from: new Date('22 April 2016'),
      to: new Date('21 May 2016'),
    }],
    participants: [
      {
        name: 'Aniruddh Agarwal',
        avatar: 'https://avatars1.githubusercontent.com/u/5279150?v=3&s=460',
      },
      {
        name: 'Akira Laine',
        avatar: 'https://avatars0.githubusercontent.com/u/11958359?v=3&s=460',
      },
      {
        name: 'Michael Johnson',
        avatar: 'https://avatars0.githubusercontent.com/u/9578097?v=3&s=460',
      },
    ],
    uid: "pli45W"
  }, {
    name: 'Event 4',
    dates: [{
      from: new Date('2 April 2016'),
      to: new Date('12 May 2016'),
    }],
    participants: [
      {
        name: 'Aniruddh Agarwal',
        avatar: 'https://avatars1.githubusercontent.com/u/5279150?v=3&s=460',
      },
      {
        name: 'Akira Laine',
        avatar: 'https://avatars0.githubusercontent.com/u/11958359?v=3&s=460',
      },
      {
        name: 'Michael Johnson',
        avatar: 'https://avatars0.githubusercontent.com/u/9578097?v=3&s=460',
      },
    ],
    uid: "W236vV"
  }, {
    name: 'Event 5',
    dates: [{
      from: new Date('19 April 2016'),
      to: new Date('21 April 2016'),
    }],
    participants: [
      {
        name: 'Aniruddh Agarwal',
        avatar: 'https://avatars1.githubusercontent.com/u/5279150?v=3&s=460',
      },
      {
        name: 'Akira Laine',
        avatar: 'https://avatars0.githubusercontent.com/u/11958359?v=3&s=460',
      },
      {
        name: 'Michael Johnson',
        avatar: 'https://avatars0.githubusercontent.com/u/9578097?v=3&s=460',
      },
    ],
    uid: "DF0vs7"
  }], () => {
    console.log('Finished populating meetings.');
  });
});
