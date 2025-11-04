import mongoose from "mongoose";

const acknowledgmentSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  acknowledged: { type: Boolean, default: false },
  timestamp: Date,
});

export default mongoose.model("Acknowledgment", acknowledgmentSchema);