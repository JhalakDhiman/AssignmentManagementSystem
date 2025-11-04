// StudentDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const { user } = useContext(AuthContext);
  const studentId = user._id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/course/getAllCourses");

        if (response.data.success) {
          console.log("Courses fetched:", response.data.courses);
          setCourses(response.data.courses);
          toast.success("Courses loaded successfully!");
        } else {
          toast.error(response.data.message || "Failed to load courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error(
          error.response?.data?.message || "Something went wrong while fetching courses."
        );
      }
    };

    fetchAllCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {

      await axios.post("http://localhost:4000/api/v1/course/enrollStudent", { courseId, studentId });
      toast.success("Enrolled successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Error enrolling");
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 bg-richblack-5 w-full gap-6">
      {courses.map((course) => (
        <div key={course._id} className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">{course.courseName}</h3>
          <p className="text-sm text-gray-600">{course.courseDescription}</p>
          <div className="flex justify-between mt-4">
            {
              course.studentsEnrolled.find(
                (student) => student._id === studentId
              ) ? (<button onClick={() => {
                navigate(`/course/${course._id}`)
              }}
                className="px-4 py-2 bg-richblue-400 text-white rounded-md"
              >
              View Details
            </button>) : (<button
              onClick={() => handleEnroll(course._id)}
              className="px-4 py-2 bg-caribbeangreen-100 text-white rounded-md"
            >
              Enroll Now
            </button>)
            }

          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentDashboard;
