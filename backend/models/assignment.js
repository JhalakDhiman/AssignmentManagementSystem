import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    assignmentName: {
        type: String,
        required: true,
    },
    description: {
        type: String,   
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    driveLink:{
        type:String,
    },
    submissionType:{
        type:String,
        enum:["Group","Individual"],
        default:"online"
    },
    acknowledgementStatus:{
        type:String
    }
   
})

export default mongoose.model("Assignment", assignmentSchema);