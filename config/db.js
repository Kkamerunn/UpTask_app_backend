import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true
        });
        console.log('Database connected!')
    } catch (error) {
        console.log('There vas an error');
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;