import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Meeting = new Schema({
  name: String,
  dates: Array,
  weekDays: Object,
  participants: Array,
});

export default mongoose.model('Meeting', Meeting);
