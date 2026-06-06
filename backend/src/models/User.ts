import mongoose from 'mongoose';
import Counter from './Counter';

const getNextSequence = async (name: string): Promise<number> => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const UserSchema = new mongoose.Schema({
  _id: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre('validate', async function (next) {
  if (this.isNew && this._id == null) {
    this._id = await getNextSequence('users');
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
