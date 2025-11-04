import Assignment from "../models/assignment.js";
import Course from "../models/course.js";
import Group from "../models/group.js";
import Acknowledgment from "../models/acknowledgment.js";

export const addAssignment = async (req, res) => {
  try {
    const { assignmentName, description, deadline, courseId, driveLink, submissionType } = req.body;
    const professorId = req.user.id;

    // ✅ Verify that the course belongs to the professor
    const course = await Course.findOne({ _id: courseId, professor: professorId });
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add assignments for this course",
      });
    }

    // ✅ Check if course already has an assignment
    if (course.assignment) {
      return res.status(400).json({
        success: false,
        message: "This course already has an assignment. Only one assignment is allowed per course.",
      });
    }

    // ✅ Create the new assignment
    const newAssignment = await Assignment.create({
      assignmentName,
      description,
      deadline,
      course: courseId,
      driveLink,
      submissionType,
    });

    // ✅ Link assignment to course
    course.assignment = newAssignment._id;
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (err) {
    console.error("Error adding assignment:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id; 

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    if (assignment.submissionType === "Individual") {
      
      const existingAck = await Acknowledgment.findOne({
        assignment: assignmentId,
        student: userId,
        acknowledged: true,
      });

      if (existingAck) {
        return res.status(400).json({
          success: false,
          message: "Assignment already submitted",
        });
      }

      
      const acknowledgment = new Acknowledgment({
        assignment: assignmentId,
        student: userId,
        acknowledged: true,
        timestamp: new Date(),
      });

      await acknowledgment.save();

      return res.status(200).json({
        success: true,
        message: "Assignment submitted successfully (Individual)",
        acknowledgment,
      });
    }

    if (assignment.submissionType === "Group") {
      
      const group = await Group.findOne({
        assignmentId,
        $or: [{ students: userId }, { groupLeader: userId }],
      });

      if (!group) {
        return res.status(400).json({
          success: false,
          message: "You are not part of any group for this assignment",
        });
      }

      if (group.groupLeader.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Only the group leader can submit the group assignment",
        });
      }

      
      if (group.assignmentSubmittedStatus) {
        return res.status(400).json({
          success: false,
          message: "Group assignment already submitted",
        });
      }

      group.assignmentSubmittedStatus = true;
      await group.save();

      const acknowledgment = new Acknowledgment({
        assignment: assignmentId,
        student: userId,
        acknowledged: true,
        timestamp: new Date(),
      });

      await acknowledgment.save();

      return res.status(200).json({
        success: true,
        message: "Group assignment submitted successfully by leader",
        group,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid submission type",
    });
  } catch (error) {
    console.error("Error in submitAssignment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting assignment",
      error: error.message,
    });
  }
};

export const getAssignmentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("courseName");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    
    const assignments = await Assignment.find({ course: courseId });

    const formattedAssignments = [];

    for (const assignment of assignments) {
      let totalEntities = 0;
      let submittedEntities = 0;
      let submittedList = []; // 🔥 store students or groups

      if (assignment.submissionType === "Individual") {
       
        const acknowledgments = await Acknowledgment.find({
          assignment: assignment._id,
        }).populate("student", "firstName lastName email");

        totalEntities = acknowledgments.length;
        submittedEntities = acknowledgments.filter((a) => a.acknowledged).length;

        submittedList = acknowledgments
          .filter((a) => a.acknowledged)
          .map((a) => ({
            name: `${a.student.firstName} ${a.student.lastName}`,
            email: a.student.email,
          }));
      } else {
        
        const groups = await Group.find({
          assignmentId: assignment._id,
        })
          .populate("groupLeader", "firstName lastName email")
          .populate("students", "firstName lastName email");

        totalEntities = groups.length;
        submittedEntities = groups.filter((g) => g.assignmentSubmittedStatus).length;

        submittedList = groups
          .filter((g) => g.assignmentSubmittedStatus)
          .map((g) => ({
            groupName: g.groupName,
            leader: `${g.groupLeader.firstName} ${g.groupLeader.lastName}`,
            members: g.students.map(
              (s) => `${s.firstName} ${s.lastName} (${s.email})`
            ),
          }));
      }

      const completionRate = totalEntities
        ? Math.round((submittedEntities / totalEntities) * 100)
        : 0;

      formattedAssignments.push({
        assignmentId: assignment._id,
        assignmentName: assignment.assignmentName,
        description: assignment.description,
        submissionType: assignment.submissionType,
        deadline: assignment.deadline,
        driveLink: assignment.driveLink,
        totalEntities,
        submittedEntities,
        completionRate,
        submittedList, // 🔥 new field
      });
    }

    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      assignments: formattedAssignments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch assignments" });
  }
};


export const getAssignmentForStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const assignments = await Assignment.find({ courseId }).lean();

    const response = [];

    for (const assignment of assignments) {
      let acknowledgmentStatus = null;
      let message = "";
      let groupInfo = null;

      if (assignment.submissionType === "Individual") {
        const ack = await Acknowledgment.findOne({
          assignment: assignment._id,
          student: studentId,
        });

        acknowledgmentStatus = ack
          ? { acknowledged: ack.acknowledged, timestamp: ack.timestamp }
          : { acknowledged: false };

      } else if (assignment.submissionType === "Group") {
        const group = await Group.findOne({
          assignment: assignment._id,
          students: studentId,
        }).populate("groupLeader students", "name email");

        if (!group) {
          message = "You are not part of any group. Form or join one to submit this assignment.";
          acknowledgmentStatus = { acknowledged: false };
        } else {
          groupInfo = {
            groupName: group.groupName,
            groupLeader: group.groupLeader,
            members: group.students,
          };

          acknowledgmentStatus = {
            acknowledged: group.assignmentSubmittedStatus.acknowledged,
            timestamp: group.assignmentSubmittedStatus.timestamp,
            acknowledgedBy: group.groupLeader,
          };
        }
      }

      response.push({
        assignmentId: assignment._id,
        name: assignment.name,
        description: assignment.description,
        deadline: assignment.deadline,
        onedriveLink: assignment.onedriveLink,
        submissionType: assignment.submissionType,
        acknowledgmentStatus,
        groupInfo,
        message,
      });
    }

    res.status(200).json({
      success: true,
      assignments: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const checkIsAssignmentSubmitted = async (req, res) => { 
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id; 

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    let isSubmitted = false;
    let submissionDetails = null;

    // Case 1️⃣: INDIVIDUAL SUBMISSION
    if (assignment.submissionType === "Individual") {
      const acknowledgment = await Acknowledgment.findOne({
        assignment: assignmentId,
        student: userId,
        acknowledged: true, // true means submitted
      });

      if (acknowledgment) {
        isSubmitted = true;
        submissionDetails = acknowledgment;
      }

    // Case 2️⃣: GROUP SUBMISSION
    } else if (assignment.submissionType === "Group") {
      // Check if user is part of any group for this assignment
      const group = await Group.findOne({
        assignmentId,
        $or: [{ students: userId }, { groupLeader: userId }],
      }).populate("groupLeader students", "firstName lastName email");

      if (group) {
        // Check if the group's submission flag is true
        if (group.assignmentSubmittedStatus) {
          isSubmitted = true;
          submissionDetails = group;
        } else {
          // Alternatively, double-check in Acknowledgment collection (for groupLeader submission)
          const leaderAck = await Acknowledgment.findOne({
            assignment: assignmentId,
            student: group.groupLeader,
            acknowledged: true,
          });

          if (leaderAck) {
            isSubmitted = true;
            submissionDetails = group;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      assignmentId,
      isSubmitted,
      submissionDetails,
      message: isSubmitted
        ? "Assignment already submitted."
        : "Assignment not yet submitted.",
    });

  } catch (error) {
    console.error("Error in checkIsAssignmentSubmitted:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking assignment submission status",
      error: error.message,
    });
  }
};
