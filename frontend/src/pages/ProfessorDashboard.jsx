import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Edit2, FilePlus2, BarChart2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { Progress } from "../components/ui/progress";

export default function ProfessorDashboard() {
  const { user, token } = useContext(AuthContext);
  const professorId = user._id;
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Separate form instance for course form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Separate form instance for assignment form
  const {
    register: assignmentRegister,
    handleSubmit: assignmentHandleSubmit,
    reset: assignmentReset,
    formState: { errors: assignmentErrors },
  } = useForm();

  // --- NEW: state for assignment status modal ---
  const [showAssignmentStatus, setShowAssignmentStatus] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  // ------------------------------------------------

  // Fetch all courses for professor
  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/v1/course/getProfessorCourses/${professorId}`
      );
      if (res.data.success) setCourses(res.data.courses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onSubmit = async (data) => {
    try {

      let payload;
      if (editingCourse) {
        payload = { ...data, courseId: editingCourse._id, instructorId: professorId };
      } else {
        payload = { ...data, instructorId: professorId };
      }
      console.log("Submitting course data:", payload);
      const res = editingCourse
        ? await axios.post(
          `http://localhost:4000/api/v1/course/updateCourse`,
          payload
        )
        : await axios.post(
          "http://localhost:4000/api/v1/course/createCourse",
          payload
        );

      if (res.data.success) {
        toast.success(
          editingCourse
            ? "Course updated successfully!"
            : "Course created successfully!"
        );
        setShowForm(false);
        setEditingCourse(null);
        reset();
        fetchCourses();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving course");
    }
  };

  const onAddAssignment = async (data) => {
    try {
      const payload = { ...data, token, courseId: selectedCourseId };
      const res = await axios.post(
        "http://localhost:4000/api/v1/assignment/addAssignment",
        payload
      );
      console.log(res);

      if (res.data.success) {
        toast.success("Assignment added successfully!");
        setShowAssignmentForm(false);
        assignmentReset();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding assignment");
    }
  };

  const handleViewAssignmentStatus = async (courseId) => {
    try {
      setLoadingAssignment(true);
      const res = await axios.get(
        `http://localhost:4000/api/v1/assignment/getAssignmentsForCourse/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAssignmentData(res.data);
      setShowAssignmentStatus(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch assignment status");
    } finally {
      setLoadingAssignment(false);
    }
  };

  return (
    <div className="min-h-screen bg-richblue-5 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-richblue-700">
            Professor Dashboard
          </h1>
          <button
            onClick={() => {
              setEditingCourse(null);
              reset();
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-caribbeangreen-100 text-white px-4 py-2 rounded-lg hover:bg-caribbeangreen-200"
          >
            <Plus className="w-5 h-5" /> Add Course
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <p className="text-richblue-300 text-center col-span-full">
              No courses created yet.
            </p>
          ) : (
            courses.map((course) => (
              <motion.div
                key={course._id}
                className="bg-white shadow-md rounded-xl p-5 border border-richblue-25"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold text-richblue-700">
                  {course.courseName}
                </h3>
                <p className="text-sm text-richblue-400 mt-2">
                  {course.courseDescription}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setShowForm(true);
                      reset(course);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-richblue-25 rounded-md text-sm hover:bg-richblue-50"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course._1d || course._id);
                      setShowAssignmentForm(true);
                      assignmentReset();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-caribbeangreen-100 rounded-md text-sm hover:bg-caribbeangreen-200 text-white"
                  >
                    <FilePlus2 size={14} /> Add Assignment
                  </button>

                  {/* NEW: View Status Button */}
                  <button
                    onClick={() => handleViewAssignmentStatus(course._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                  >
                    <BarChart2 size={14} /> View Status
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Course Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold text-richblue-700 mb-4">
                {editingCourse ? "Edit Course" : "Add Course"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    Course Name
                  </label>
                  <input
                    {...register("courseName", {
                      required: "Course name is required",
                    })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                    placeholder="Enter course name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    Course Description
                  </label>
                  <textarea
                    {...register("courseDescription", {
                      required: "Course description is required",
                    })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                    placeholder="Enter course description"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCourse(null);
                      reset();
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-caribbeangreen-100 text-white rounded-md hover:bg-caribbeangreen-200"
                  >
                    {editingCourse ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Assignment Form */}
      <AnimatePresence>
        {showAssignmentForm && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold text-richblue-700 mb-4">
                Add Assignment
              </h2>
              <form
                onSubmit={assignmentHandleSubmit(onAddAssignment)}
                className="space-y-4"
              >
                {/* Assignment Name */}
                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    Assignment Name
                  </label>
                  <input
                    {...assignmentRegister("assignmentName", {
                      required: "Assignment name is required",
                    })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                    placeholder="Enter assignment name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    Description
                  </label>
                  <textarea
                    {...assignmentRegister("description", {
                      required: "Description is required",
                    })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                    placeholder="Enter assignment description"
                  />
                </div>

                {/* Submission Type */}
                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    Submission Type
                  </label>
                  <select
                    {...assignmentRegister("submissionType", { required: true })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                  >
                    <option value="">Select type</option>
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    Deadline (Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    {...assignmentRegister("deadline", {
                      required: "Deadline is required",
                    })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                  />
                </div>

                {/* OneDrive Submission Link */}
                <div>
                  <label className="block text-sm font-medium text-richblue-600 mb-1">
                    OneDrive Submission Link
                  </label>
                  <input
                    type="url"
                    {...assignmentRegister("driveLink", {
                      required: "OneDrive link is required",
                    })}
                    className="w-full border border-richblue-25 px-3 py-2 rounded-lg focus:ring-2 focus:ring-caribbeangreen-100"
                    placeholder="https://onedrive.live.com/..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignmentForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-caribbeangreen-100 text-white rounded-md hover:bg-caribbeangreen-200"
                  >
                    Add Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Assignment Status Modal */}
      <AnimatePresence>
        {showAssignmentStatus && assignmentData && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold text-richblue-700 mb-4">
                {assignmentData.courseName} — Assignment Overview
              </h2>

              {assignmentData.assignments.map((a) => (
                <div key={a.assignmentId} className="mb-6 pb-4">
                  <h3 className="text-lg font-semibold text-richblue-700">
                    {a.assignmentName}
                  </h3>
                  <p className="text-sm text-richblue-400">{a.description}</p>

                  <div className="mt-3 text-sm text-richblue-600 space-y-1">
                    <p>
                      <strong>Submission Type:</strong> {a.submissionType}
                    </p>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {new Date(a.deadline).toLocaleString()}
                    </p>
                    <p>
                      <strong>Drive Link:</strong>{" "}
                      <a
                        href={a.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-caribbeangreen-100 underline"
                      >
                        View Link
                      </a>
                    </p>
                    <p className="pb-2">
                      <strong>Submitted:</strong> {a.submittedEntities} / {a.totalEntities}
                    </p>

                    {/* Display the list of submitted users or groups */}
                    {a.submittedList && a.submittedList.length > 0 ? (
                      <div className="mt-2 border-t pt-2">
                        <p className="font-medium text-richblue-600 mb-1">
                          {a.submissionType === "Group"
                            ? "Groups that submitted:"
                            : "Students that submitted:"}
                        </p>

                        <ul className="space-y-1 text-sm text-richblue-500 list-disc pl-5">
                          {a.submissionType === "Individual"
                            ? a.submittedList.map((s, i) => (
                              <li key={i}>
                                {s.name} – <span className="text-xs text-gray-500">{s.email}</span>
                              </li>
                            ))
                            : a.submittedList.map((g, i) => (
                              <li key={i}>
                                <strong>{g.groupName}</strong> (Leader: {g.leader})
                                <br />
                                <span className="text-xs text-gray-500">
                                  Members: {g.members.join(", ")}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No submissions yet.</p>
                    )}


                    {/* Progress bar */}
                    <div className="w-full mt-6">
                      {/* Progress Bar Container */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        {/* Filled Bar */}
                        <Progress value={a.completionRate}></Progress>
                      </div>

                      {/* Progress Label */}
                      <p className="text-right text-xs text-richblue-400 mt-1 font-medium">
                        {a.completionRate}% Completed
                      </p>
                    </div>

                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowAssignmentStatus(false)}
                  className=" px-4 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
