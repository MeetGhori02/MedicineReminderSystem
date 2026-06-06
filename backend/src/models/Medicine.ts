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

const MedicineSchema = new mongoose.Schema({
  _id: { type: Number },
  userId: { type: Number, required: true, ref: 'User' },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  frequency: { type: String, enum: ['ONCE', 'DAILY', 'WEEKLY'], default: 'DAILY' },
  beforeAfterFood: { type: String, enum: ['BEFORE', 'AFTER', 'WITH'], default: 'AFTER' },
  mealTimings: { type: String },
  notes: { type: String },
  reminderEnabled: { type: Boolean, default: true },
  taken: { type: Boolean, default: false },
  takenAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MedicineSchema.pre('validate', async function (next) {
  if (this.isNew && this._id == null) {
    this._id = await getNextSequence('medicines');
  }
  next();
});

export default mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
