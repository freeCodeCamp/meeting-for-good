import mongoose from 'mongoose';
import 'mongoose-type-email';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: { type: String, required: false },
  facebookId: { type: String, required: false },
  emails: [{ type: mongoose.SchemaTypes.Email, required: true }],
  name: { type: String, required: true },
  avatar: { type: String, required: false },
});

export default mongoose.model('User', UserSchema);
