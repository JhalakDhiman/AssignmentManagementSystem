import express from "express"
import dotenv from 'dotenv'
import dbConnect from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'
import assignmentRoutes from './routes/assignmentRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import courseRoutes from './routes/courseRoutes.js'

dotenv.config();

const PORT = process.env.PORT;
const app = express();

dbConnect();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"*",
        credentials:true,
    })
)

app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/group',groupRoutes);
app.use('/api/v1/assignment',assignmentRoutes);
app.use('/api/v1/course',courseRoutes);


app.get('/',(req,res)=>{
    return res.json({
        success:true,
        message:"server is running........"
    })
})

app.listen(PORT,()=>{
    console.log(`server started ${PORT}`);
})
