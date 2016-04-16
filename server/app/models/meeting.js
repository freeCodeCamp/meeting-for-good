import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Meeting = new Schema({
  name: String,
  dates: Array,
  participants: Array,
});

export default mongoose.model('Meeting', Meeting);
