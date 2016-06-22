import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const User = new Schema({
  googleId: String,
  facebookId: String,
  name: String,
  avatar: String,
});

export default mongoose.model('User', User);
