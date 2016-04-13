import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Meeting = new Schema({
  name: String,
  preferredTime: String,
  preferredDate: Date,
  participants: Array,
});

export default mongoose.model('Meeting', Meeting);
