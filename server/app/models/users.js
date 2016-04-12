import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const User = new Schema({
  github: {
    id: String,
    displayName: String,
    username: String,
    publicRepos: Number,
  },
  nbrClicks: {
    clicks: Number,
  },
});

export default mongoose.model('User', User);
