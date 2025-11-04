import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProfessorDashboard from './pages/ProfessorDashboard';
import { AuthContext } from './context/AuthContext';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetails from './pages/CourseDetails';
import Home from './pages/Home';
import Navbar from './_components/Navbar';


function App() {

  const {user} = useContext(AuthContext);
  
  return (
    <div className='bg-richblue-5 h-[100vh] w-[100vw] overflow-x-hidden'>
      <Navbar/>

      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />





        {
          user && user?.accountType === "Professor" && (
            <>
              <Route path='/professor-dashboard' element={<ProfessorDashboard />} />
            </>
          )
        }

        
       {
          user && user?.accountType === "Student" && (
            <>
              <Route path='/student-dashboard' element={<StudentDashboard />} />
              <Route path='/course/:courseId' element={<CourseDetails />} />
            </>
          )
        }
      </Routes>
    </div>
  );
}

export default App;