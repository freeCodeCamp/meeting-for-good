import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const avaibilitySchama = new Schema({ type: Array, required: false });


const participantsSchema = new Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  availability: Array,
  userId: { type: String, required: true },
});


const dates =  new Schema({
  toDate: { type: Date, required: true },
  fromDate: { type: Date, required: true },
});

const Event = new Schema({
  name: { type: String, required: true },
  dates: [dates],
  active: { type: Boolean, required: true },
  weekDays: Object,
  participants: [participantsSchema],
  uid: { type: String, required: true },
  selectedTimeRange: Array,
  owner: { type: String, required: true },
});

export default mongoose.model('Event', Event);
