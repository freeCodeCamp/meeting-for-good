import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: { type: String, required: false, unique: true },
  facebookId: { type: String, required: false },
  emails: Array,
  name: { type: String, required: true },
  avatar: { type: String, required: false },
  accessToken: { type: String, required: false },
  refreshToken: { type: String, required: false },
  enablePrimaryCalendar: { type: Boolean, required: true, default: true },
  selectedCalendarsIds: { type: [String], required: false, unique: true },
});

export default mongoose.model('User', UserSchema);
