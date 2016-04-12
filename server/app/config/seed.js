import Meeting from '../models/meeting.js';

Meeting.find({}).remove(() => {
  Meeting.create([{
    name: 'Event 1',
    preferredDate: Date('27 March 2015'),
    preferredTime: '9:00 AM to 10:00 AM',
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
  }, {
    name: 'Event 1',
    preferredDate: Date('27 March 2015'),
    preferredTime: '9:00 AM to 10:00 AM',
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
  }, {
    name: 'Event 1',
    preferredDate: Date('27 March 2015'),
    preferredTime: '9:00 AM to 10:00 AM',
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
  }, {
    name: 'Event 2',
    preferredDate: Date('31 March 2015'),
    preferredTime: '9:00 AM to 10:00 AM',
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
  }, {
    name: 'Event 4',
    preferredDate: Date('27 March 2015'),
    preferredTime: '9:00 AM to 10:00 AM',
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
  }], () => {
    console.log('finished populating users');
  });
});
