var Meeting = require('../models/meeting.js');
var moment = require('moment');

Meeting.find({}).remove(function() {
  Meeting.create([{
    name: 'Event 1',
    preferredDate: moment('27 March 2015').toDate(),
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
    preferredDate: moment('27 March 2015').toDate(),
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
    preferredDate: moment('27 March 2015').toDate(),
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
    preferredDate: moment('31 March 2015').toDate(),
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
    preferredDate: moment('27 March 2015').toDate(),
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
  }], function() {
    console.log('finished populating users');
  });
});
