import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
    },
    courseDescription: {
        type: String,
        required: true,
    },
    professor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    assignment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Assignment"
    }
})

export default mongoose.model("Course", courseSchema);