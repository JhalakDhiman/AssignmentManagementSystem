import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnect = ()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }).then(()=>{
        console.log("db connected successfully");
    }).catch((error)=>{
        console.log("error here : ",error);
        process.exit(1);
    })
}

export default dbConnect;