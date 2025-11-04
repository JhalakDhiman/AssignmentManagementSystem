import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
      },
    ],
    groupLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Assignment"
    },
    assignmentSubmittedStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

groupSchema.pre("save", function (next) {
  if (!this.students.includes(this.groupLeader)) {
    return next(new Error("Group leader must be one of the group members"));
  }
  next();
});

export default mongoose.model("Group", groupSchema);
