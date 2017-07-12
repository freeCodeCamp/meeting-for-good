import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const participantsSchema = new Schema({
  availability: [[{ type: Date, required: true }]],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerNotified: { type: Boolean, required: true, default: false },
  emailUpdate: { type: Boolean, required: true, default: false },
  /**
   *  here whe define the status os the user-guest in
   *  relaction to this Event
   *  0 inactive - when the guest is deleted from the Event
   *  1 invited
   *  2 joined the Event - --default--
   *  3 has added hes time table
   */
  status: { type: Number, min: 0, max: 3, default: 2, required: true },
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
  owner: { type: String, required: true },
});

export default mongoose.model('Event', EventSchema);
