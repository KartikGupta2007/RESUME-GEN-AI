import mongoose from 'mongoose';
import { DB_Name } from '../constants.js';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI.endsWith('/') 
            ? process.env.MONGODB_URI.slice(0, -1) 
            : process.env.MONGODB_URI;
        const connectionInstance = await mongoose.connect(`${uri}/${DB_Name}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;