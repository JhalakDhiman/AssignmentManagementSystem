// Mock data store using localStorage

const STORAGE_KEYS = {
  USERS: "users",
  ASSIGNMENTS: "assignments",
  SUBMISSIONS: "submissions",
  CURRENT_USER: "currentUser",
};

export function initializeMockData() {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    const mockUsers = [
      { id: "1", name: "John Student", email: "john@student.com", role: "student" },
      { id: "2", name: "Jane Student", email: "jane@student.com", role: "student" },
      { id: "3", name: "Prof. Admin", email: "prof@admin.com", role: "admin" },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }

  const existingAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  if (!existingAssignments) {
    const mockAssignments = [
      {
        id: "1",
        title: "React Fundamentals",
        description: "Build a todo app using React hooks",
        dueDate: "2025-11-15",
        driveLink: "https://drive.google.com/example1",
        createdBy: "3",
        createdAt: "2025-10-20",
      },
      {
        id: "2",
        title: "TypeScript Basics",
        description: "Complete TypeScript exercises",
        dueDate: "2025-11-20",
        driveLink: "https://drive.google.com/example2",
        createdBy: "3",
        createdAt: "2025-10-21",
      },
      {
        id: "3",
        title: "API Integration",
        description: "Integrate REST API with React",
        dueDate: "2025-11-25",
        driveLink: "https://drive.google.com/example3",
        createdBy: "3",
        createdAt: "2025-10-22",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(mockAssignments));
  }

  const existingSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!existingSubmissions) {
    const mockSubmissions = [
      {
        id: "1",
        assignmentId: "1",
        studentId: "1",
        submitted: true,
        submittedAt: "2025-11-14",
        status: "submitted",
        progress: 100,
      },
      { id: "2", assignmentId: "1", studentId: "2", submitted: false, status: "not_started", progress: 0 },
      { id: "3", assignmentId: "2", studentId: "1", submitted: false, status: "not_started", progress: 0 },
      {
        id: "4",
        assignmentId: "2",
        studentId: "2",
        submitted: true,
        submittedAt: "2025-11-19",
        status: "submitted",
        progress: 100,
      },
      { id: "5", assignmentId: "3", studentId: "1", submitted: false, status: "not_started", progress: 0 },
      { id: "6", assignmentId: "3", studentId: "2", submitted: false, status: "not_started", progress: 0 },
    ];
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(mockSubmissions));
  }
}

// ---------------------- USERS ----------------------

export function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function getAllUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

// ---------------------- ASSIGNMENTS ----------------------

export function getAllAssignments() {
  const assignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return assignments ? JSON.parse(assignments) : [];
}

export function getAssignmentById(id) {
  return getAllAssignments().find((a) => a.id === id);
}

export function createAssignment(assignment) {
  const assignments = getAllAssignments();
  const newAssignment = {
    ...assignment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split("T")[0],
  };
  assignments.push(newAssignment);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  return newAssignment;
}

export function updateAssignment(id, updates) {
  const assignments = getAllAssignments();
  const index = assignments.findIndex((a) => a.id === id);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }
}

export function deleteAssignment(id) {
  const assignments = getAllAssignments();
  const filtered = assignments.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filtered));
}

// ---------------------- SUBMISSIONS ----------------------

export function getAllSubmissions() {
  const submissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return submissions ? JSON.parse(submissions) : [];
}

export function getSubmissionsByAssignment(assignmentId) {
  return getAllSubmissions().filter((s) => s.assignmentId === assignmentId);
}

export function getSubmissionsByStudent(studentId) {
  return getAllSubmissions().filter((s) => s.studentId === studentId);
}

export function getSubmission(assignmentId, studentId) {
  return getAllSubmissions().find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );
}

export function submitAssignment(assignmentId, studentId) {
  const submissions = getAllSubmissions();
  let submission = submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );

  const assignment = getAssignmentById(assignmentId);
  const isLate = assignment && new Date() > new Date(assignment.dueDate);

  if (submission) {
    submission.submitted = true;
    submission.submittedAt = new Date().toISOString().split("T")[0];
    submission.status = isLate ? "late" : "submitted";
    submission.progress = 100;
  } else {
    submission = {
      id: Date.now().toString(),
      assignmentId,
      studentId,
      submitted: true,
      submittedAt: new Date().toISOString().split("T")[0],
      status: isLate ? "late" : "submitted",
      progress: 100,
    };
    submissions.push(submission);
  }

  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  return submission;
}

export function updateSubmissionProgress(assignmentId, studentId, progress) {
  const submissions = getAllSubmissions();
  const submission = submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );

  if (submission) {
    submission.progress = Math.min(100, Math.max(0, progress));
    submission.status =
      progress === 0
        ? "not_started"
        : progress === 100
        ? submission.status
        : "in_progress";
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }
  return submission;
}

export function updateSubmissionFeedback(assignmentId, studentId, feedback, grade) {
  const submissions = getAllSubmissions();
  const submission = submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );

  if (submission) {
    submission.feedback = feedback;
    submission.grade = grade;
    submission.status = "graded";
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }
  return submission;
}

// ---------------------- STATS ----------------------

export function getSubmissionStats(assignmentId) {
  const submissions = getSubmissionsByAssignment(assignmentId);
  return {
    total: submissions.length,
    submitted: submissions.filter((s) => s.submitted).length,
    late: submissions.filter((s) => s.status === "late").length,
    graded: submissions.filter((s) => s.status === "graded").length,
    inProgress: submissions.filter((s) => s.status === "in_progress").length,
    notStarted: submissions.filter((s) => s.status === "not_started").length,
    averageProgress:
      submissions.length > 0
        ? Math.round(
            submissions.reduce((sum, s) => sum + s.progress, 0) /
              submissions.length
          )
        : 0,
  };
}

export function getStudentProgress(studentId) {
  const submissions = getSubmissionsByStudent(studentId);
  const assignments = getAllAssignments();

  return {
    total: assignments.length,
    submitted: submissions.filter((s) => s.submitted).length,
    late: submissions.filter((s) => s.status === "late").length,
    graded: submissions.filter((s) => s.status === "graded").length,
    averageProgress:
      submissions.length > 0
        ? Math.round(
            submissions.reduce((sum, s) => sum + s.progress, 0) /
              submissions.length
          )
        : 0,
    submissions: submissions,
  };
}
