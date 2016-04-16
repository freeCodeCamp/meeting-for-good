import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const User = new Schema({
  local: {
    username: String,
    password: String
  },
  github: {
    id: String,
    username: String,
    avatar: String
  },
  facebook: {
    id: String,
    username: String,
    avatar: String
  }
});

export default mongoose.model('User', User);
