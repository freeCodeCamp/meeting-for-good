import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StatsSchema = new Schema({
  events: { type: Number, required: true },
  users: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  avgParticipants: { type: Number, required: true },
  eventsToday: { type: Number, required: true },
  weekAvg: { type: Number, require: true },
});

export default mongoose.model('Stats', StatsSchema);
