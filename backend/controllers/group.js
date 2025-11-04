// controllers/groupController.js
import Group from "../models/group.js";
import User from "../models/user.js";
import Assignment from "../models/assignment.js";
import Course from "../models/course.js";

export const createGroup = async (req, res) => {
  try {
    const { groupName, memberIds, assignmentId } = req.body;
    const creatorId = req.user.id;

    console.log("Creating group with data");

    if (!groupName || !memberIds || !assignmentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const assignment = await Assignment.findById(assignmentId).populate("course");
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (assignment.submissionType !== "Group") {
      return res
        .status(400)
        .json({ message: "This assignment is for individual submission only" });
    }

    const course = await Course.findById(assignment.course);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const notEnrolled = memberIds.filter(
      (id) => !course.studentsEnrolled.map((s) => s.toString()).includes(id)
    );
    if (notEnrolled.length > 0) {
      return res.status(400).json({
        message: "Some students are not enrolled in this course",
        notEnrolled,
      });
    }

    const existingGroups = await Group.find({
      students: { $in: memberIds },
      assignmentId: assignmentId,
    });
    if (existingGroups.length > 0) {
      return res.status(400).json({
        message: "One or more members already belong to another group for this assignment",
      });
    }

    if (!memberIds.includes(creatorId.toString())) {
      memberIds.push(creatorId);
    }

    const groupLeader = creatorId;

    const newGroup = await Group.create({
      groupName,
      students: memberIds,
      groupLeader,
      assignmentSubmittedStatus: false,
      assignmentId,
    });

    const populatedGroup = await Group.findById(newGroup._id)
      .populate("students", "firstName lastName email image")
      .populate("groupLeader", "firstName lastName email image");

    console.log("New group created:", populatedGroup);

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: populatedGroup,
    });

  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getEligibleStudentsForGroup = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId).populate("course");
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.course._id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const allEnrolled = course.studentsEnrolled.map((id) => id.toString());
    console.log("All enrolled students:", allEnrolled);

    const groups = await Group.find({ assignmentId });
    const groupedStudents = groups?.flatMap((g) => g.students.map((id) => id.toString()));
   
    const eligibleStudentIds = allEnrolled.filter((id) => !groupedStudents.includes(id));
  
    const eligibleStudents = await User.find({ _id: { $in: eligibleStudentIds } })
      .select("firstName lastName email _id");
      console.log("Eligible student details:", eligibleStudents);

    return res.status(200).json({
      success: true,
      eligibleStudents,
    });
  } catch (error) {
    console.error("Error fetching eligible students:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching eligible students",
      error: error.message,
    });
  }
};

export const checkUserGroupStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "Assignment ID is required" });
    }

    const group = await Group.findOne({
      assignmentId,
      $or: [
        { students: userId },
        { groupLeader: userId }
      ]
    }).populate("groupLeader students", "firstName lastName email");

    if (!group) {
      return res.status(200).json({
        success: true,
        alreadyInGroup: false,
        message: "User is not part of any group for this assignment"
      });
    }

    return res.status(200).json({
      success: true,
      alreadyInGroup: true,
      group,
      message: "User is already part of a group for this assignment"
    });
  } catch (error) {
    console.error("Error checking user group status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking group status",
    });
  }
};
