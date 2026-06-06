import mongoose from 'mongoose';

const connectMongo = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/MRS';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
  return mongoose;
};

export default connectMongo;
