import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import CreateGroupModal from "../_components/CreateGroupModal.jsx";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { Progress } from "../components/ui/progress.jsx";

const CourseDetails = () => {
  const [assignment, setAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [groupStatus, setGroupStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user, token } = useContext(AuthContext);
  const BASE_URL = process.env.REACT_APP_BASE_URL

  const location = useLocation();
  const courseId = location.pathname.split("/").pop();
  const [created,setCreated] = useState(false)

  // 🔹 Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/course/getCourseDetails/${courseId}`
        );

        if (response.data.success) {
          setAssignment(response.data.course.assignment);
          toast.success("Course details loaded successfully!");
        } else {
          toast.error(
            response.data.message || "Failed to load course details."
          );
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error(
          error.response?.data?.message ||
            "Something went wrong while fetching course details."
        );
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    const checkUserGroupStatus = async () => {
      if (!assignment?._id) return;
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/group/checkUserGroupStatus/${assignment._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setGroupStatus(res.data);
        } else {
          toast.error(res.data.message || "Could not fetch group status");
        }
      } catch (err) {
        console.error("Error checking group status:", err);
        toast.error(
          err.response?.data?.message || "Failed to fetch group status"
        );
      } finally {
        setLoading(false);
      }
    };

    checkUserGroupStatus();
  }, [assignment, token]);


  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!assignment?._id) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/assignment/checkIsAssignmentSubmitted/${assignment._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success && res.data.isSubmitted) {
          setIsSubmitted(true);
          setProgress(100);
        } else {
          setIsSubmitted(false);
          setProgress(0);
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to check assignment submission status"
        );
      }
    };

    checkSubmissionStatus();
  }, [assignment, token]);

  const handleSubmitAssignment = async () => {
    if (!assignment?._id) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/assignment/submitAssignment/${assignment._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setIsSubmitted(true);
        setProgress(100);
      } else {
        toast.error(res.data.message || "Failed to submit assignment");
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
      toast.error(
        err.response?.data?.message || "Failed to submit assignment"
      );
    }
  };

  return (
    <div className="p-6">
      {assignment && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold">{assignment.assignmentName}</h2>
          <p className="text-gray-600 mt-2">{assignment.description}</p>
          <p className="mt-2 text-sm">
            Submission Type: <strong>{assignment.submissionType}</strong>
          </p>

          
          <div className="my-4">
            <Progress value={progress}/>
            <p>{progress}% completed</p>
          </div>

          <p className="text-sm mt-1">
            {isSubmitted ? "Assignment Submitted ✅" : "Not Submitted ❌"}
          </p>

          {assignment.submissionType === "Group" && !loading && !created (
            <>
              {!groupStatus?.alreadyInGroup ? (
                <button
                  className="mt-4 px-4 py-2 bg-caribbeangreen-100 text-white rounded-md"
                  onClick={() => setShowModal(true)}
                >
                  Create Group
                </button>
              ) : (
                <div className="mt-4 border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Your Group Details
                  </h3>

                  <p className="text-sm mb-1">
                    <strong>Group Name:</strong>{" "}
                    {groupStatus?.group?.groupName || "N/A"}
                  </p>

                  <p className="text-sm mb-1">
                    <strong>Group Leader:</strong>{" "}
                    {groupStatus?.group?.groupLeader?.firstName}{" "}
                    {groupStatus?.group?.groupLeader?.lastName}
                  </p>

                  <p className="text-sm mb-2">
                    <strong>Members:</strong>
                  </p>
                  <ul className="list-disc ml-5 text-sm">
                    {groupStatus?.group?.students?.map((m) => (
                      <li key={m._id}>
                        {m.firstName} {m.lastName} ({m.email})
                      </li>
                    ))}
                  </ul>

                  {/* 🔹 Show Submit button only if not submitted */}
                  {!isSubmitted && (
                    <button
                      onClick={handleSubmitAssignment}
                      className="mt-4 px-4 py-2 bg-caribbeangreen-100 text-white rounded-md"
                    >
                      Submit Assignment
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* 🔹 For Individual submissions */}
          {assignment.submissionType === "Individual" && (
            <>
              {!isSubmitted && (
                <button
                  onClick={handleSubmitAssignment}
                  className="mt-4 px-4 py-2 bg-caribbeangreen-100 text-white rounded-md"
                >
                  Submit Assignment
                </button>
              )}
            </>
          )}
        </div>
      )}

      {showModal && (
        <CreateGroupModal
          assignmentId={assignment._id}
          onClose={() => setShowModal(false)}
          setCreated
        />
      )}
    </div>
  );
};

export default CourseDetails;
