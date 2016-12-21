import mongoose from 'mongoose';

const Schema = mongoose.Schema;
// ----------------------------- new proposal model -------------
// coment only to solve the webpack issues first
// const availabilitySchema = new Schema([]);

/* const participantsSchema = new Schema({
  name: { type: 'String', required: true },
  avatar: { type: 'String', required: true },
  availability: { type: 'Array', required: true },
  uId: { type: 'String', required: true },
});

const Event = new Schema({
  name: { type: 'String', required: true },

  dates: { type: 'Array', required: true },
  active: { type: 'Boolean', default: true },
  weekDays: { type: 'Object', required: false },
  participants: [participantsSchema],
  uid: { type: 'String', required: true },
  selectedTimeRange: { type: 'Array', required: true },
  owner: { type: 'String', required: true },
});*/
// ----------------------------- new proposal model -------------
const Event = new Schema({
  name: { type: String, required: true },
  dates: Array,
  active: { type: Boolean, required: true },
  weekDays: Object,
  participants: Array,
  uid: { type: 'String', required: true },
  selectedTimeRange: Array,
  owner: { type: 'String', required: true },
});

export default mongoose.model('Event', Event);
