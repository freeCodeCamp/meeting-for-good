import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
  googleId: { type: 'String', required: false },
  facebookId: { type: 'String', required: false },
  name: { type: 'String', required: true },
  avatar: { type: 'String', required: false },
});

export default mongoose.model('User', User);
