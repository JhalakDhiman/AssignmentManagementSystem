import Course from "../models/course.js";
import User from "../models/user.js";
import Assignment from "../models/assignment.js";

export const createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, instructorId } = req.body;

    if (!courseName || !courseDescription || !instructorId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const instructor = await User.findById(instructorId);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found.",
      });
    }

    if (instructor.accountType !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can create courses.",
      });
    }

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      professor: instructorId,
    });

    instructor.courses.push(newCourse._id);
    await instructor.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course: newCourse,
    });
  } catch (error) {
    console.error(" Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating course.",
    });
  }
};

export const enrollStudentInCourse = async (req, res) => {
  try {
    const { courseId,studentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (course.studentsEnrolled.includes(studentId)) {
      return res.status(400).json({ success: false, message: "Student already enrolled" });
    }

    course.studentsEnrolled.push(studentId);
    await course.save();

    if (!student.courses) {
      student.courses = [];
    }
    if (!student.courses.includes(courseId)) {
      student.courses.push(courseId);
      await student.save();
    }

    return res.status(200).json({
      success: true,
      message: "Student enrolled successfully in course",
      course,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return res.status(500).json({
      success: false,
      message: "Error enrolling student in course",
      error: error.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId, courseName, courseDescription, instructorId } = req.body;
    console.log(courseId,courseName,courseDescription,instructorId);

    if (!courseId || !instructorId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and Instructor ID are required.",
      });
    }

    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found.",
      });
    }

    if (instructor.accountType !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can update courses.",
      });
    }

    if (existingCourse?.professor?.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this course.",
      });
    }

    if (courseName) existingCourse.courseName = courseName;
    if (courseDescription) existingCourse.courseDescription = courseDescription;
    if (existingCourse.assignment) {
      await Assignment.findByIdAndDelete(existingCourse.assignment);
      existingCourse.assignment = null;
    }

    const updatedCourse = await existingCourse.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error(" Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating course.",
    });
  }
};

export const getProfessorCourses = async (req, res) => {
  try {
    const { professorId } = req.params;

    if (!professorId) {
      return res.status(400).json({
        success: false,
        message: "Professor ID is required.",
      });
    }

    const professor = await User.findById(professorId);
    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor not found.",
      });
    }

    if (professor.accountType !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can have courses.",
      });
    }

    const courses = await Course.find({ professor: professorId })
      .populate("studentsEnrolled", "firstName lastName email") // optional
      .populate("assignment", "assignmentName description submissionType") // optional
      .sort({ createdAt: -1 }); // newest first

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        message: "No courses found for this professor.",
        courses: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully.",
      courses,
    });

  } catch (error) {
    console.error("Error fetching professor's courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses.",
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({
        path: "professor",
        select: "firstName lastName email accountType",
      })
      .populate({
        path: "assignment",
        select: "assignmentName description deadline submissionType driveLink",
      })
      .populate({
        path: "studentsEnrolled",
        select: "firstName lastName email",
      });

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found in the database.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully.",
      totalCourses: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses.",
      error: error.message,
    });
  }
};

export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    // Fetch course and populate related details
    const course = await Course.findById(courseId)
      .populate({
        path: "professor",
        select: "firstName lastName email accountType",
      })
      .populate({
        path: "assignment",
        select: "assignmentName description deadline submissionType driveLink",
      })
      
      console.log(course);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully.",
      course,
    });
  } catch (error) {
    console.error(" Error fetching course details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching course details.",
    });
  }
};