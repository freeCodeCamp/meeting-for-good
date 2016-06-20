import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Event = new Schema({
  name: String,
  dates: Array,
  active: Boolean,
  weekDays: Object,
  participants: Array,
  uid: String,
  selectedTimeRange: Array,
  owner: String,
});

export default mongoose.model('Event', Event);
