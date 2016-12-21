import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Event = new Schema({
  name: { type: 'String', required: true },
  dates: Array,
  active: Boolean,
  weekDays: Object,
  participants: Array,
  uid: { type: 'String', required: true },
  selectedTimeRange: Array,
  owner: { type: 'String', required: true },
});

export default mongoose.model('Event', Event);
