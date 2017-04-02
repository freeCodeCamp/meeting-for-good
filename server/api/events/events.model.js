import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const participantsSchema = new Schema({
  availability: Array,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  ownerNotified: { type: Boolean, required: true, default: false },
  emailUpdate: { type: Boolean, required: true, default: false },
});

const datesSchema =  new Schema({
  toDate: { type: Date, required: true },
  fromDate: { type: Date, required: true },
});

const EventSchema = new Schema({
  name: { type: String, required: true },
  dates: [datesSchema],
  active: { type: Boolean, required: true },
  participants: [participantsSchema],
  selectedTimeRange: Array,
  owner: { type: String, required: true },
});

export default mongoose.model('Event', EventSchema);
