import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const User = new Schema({
  github: {
    id: String,
    username: String,
    avatar: String
  }
});

export default mongoose.model('User', User);
