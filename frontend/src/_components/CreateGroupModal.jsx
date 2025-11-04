import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X } from "lucide-react"; 
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateGroupModal = ({ assignmentId, onClose }) => {

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const [groupName, setGroupName] = useState("");
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [leader, setLeader] = useState("");
  const [loading, setLoading] = useState(false);
  const { user,token } = useContext(AuthContext);

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/group/getEligibleStudentsForGroup/${assignmentId}`
        );

        const filteredStudents = res.data.eligibleStudents.filter(
          (student) => student._id !== user?._id
        );

        if(filteredStudents.length===0){
          toast.error("sorry, no student is available");
          return;
        }

        setEligibleStudents(filteredStudents);

        setLeader(user?._id);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchEligibleStudents();
  }, [assignmentId, user?._id]);

  const handleAddMember = (id) => {
    const selected = eligibleStudents.find((s) => s._id === id);
    if (!selectedMembers.some((s) => s._id === id)) {
      setSelectedMembers([...selectedMembers, selected]);
    }
  };

  const handleRemoveMember = (id) => {
    setSelectedMembers(selectedMembers.filter((s) => s._id !== id));
    if (leader === id) setLeader(""); // reset leader if removed
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    if (!leader) {
      toast.error("Please select a group leader");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/group/createGroup`,
        {
          groupName,
          memberIds: selectedMembers.map((s) => s._id),
          assignmentId,
          groupLeader: leader,
          token
        },
      );
      console.log("Group creation response:", res.data);

      toast.success("Group created successfully!");
      navigate(0);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error creating group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[420px]">
        <h2 className="text-lg font-bold mb-4 text-center">Create Group</h2>

        {/* Group Name */}
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full border rounded p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-100"
        />

        {/* Member selection */}
        <label className="text-sm font-semibold mb-1 block">Select Members:</label>
        <select
          className="w-full border rounded p-2 mb-3"
          onChange={(e) => handleAddMember(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Choose a student to add
          </option>
          {eligibleStudents
            .filter((s) => !selectedMembers.some((sel) => sel._id === s._id))
            .map((student) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.email})
              </option>
            ))}
        </select>

        {/* Selected Members Display */}
        {selectedMembers.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedMembers.map((s) => (
              <div
                key={s._id}
                className="flex items-center bg-caribbeangreen-50 text-caribbeangreen-800 px-3 py-1 rounded-full text-sm"
              >
                {s.firstName} {s.lastName}
                <button
                  onClick={() => handleRemoveMember(s._id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Leader selection */}
        {selectedMembers.length > 0 && (
          <>
            <label className="text-sm font-semibold mb-1 block">
              Select Group Leader:
            </label>
            <select
              className="w-full border rounded p-2 mb-4"
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
            >
              <option value={user?._id}>
                {user?.firstName} {user?.lastName} (You)
              </option>
              {selectedMembers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className="px-4 py-2 bg-caribbeangreen-100 text-white rounded-md hover:bg-caribbeangreen-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
