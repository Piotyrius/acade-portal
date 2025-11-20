import React from 'react'
import { Link } from 'react-router-dom'
import './Layout.css'

import { TbLayoutDashboard } from "react-icons/tb";
import { IoBookOutline } from "react-icons/io5";
import { FiAward, FiBook, FiUsers, FiCalendar, FiUserPlus, FiCheckCircle, FiBarChart2, FiClock, FiImage, FiClipboard } from "react-icons/fi";

import CyberLogo from '../assets/images/academy-logo.jpg'

const Sidebar = () => {
  return (
    <aside className='sidebar'>

      <div className='cyber_academy_wrapper'>
        <img src={CyberLogo} alt='Cyber academy' />
        <h2> Cyber Academy </h2>
      </div>


      <div className='links_wrapper'>
        <Link to={'/catalog/dashboard'} className='links' > <TbLayoutDashboard className='link-icon' /> Dashboard</Link>
        <Link to={'/catalog/programs'} className='links' > <IoBookOutline className='link-icon' /> Programs</Link>
        <Link to={'/catalog/cources'} className='links' > <FiBook className='link-icon' /> Courses</Link>
        <Link to={'/catalog/cohorts'} className='links' > <FiUsers className='link-icon' /> Cohorts</Link>
        <Link to={'/catalog/sessions'} className='links' > <FiCalendar className='link-icon' /> Sessions</Link>
        <Link to={'/catalog/admissions'} className='links' > <FiUserPlus className='link-icon' /> Admissions</Link>
        <Link to={'/catalog/attendance'} className='links' > <FiCheckCircle className='link-icon' /> Attendance</Link>
        <Link to={'/catalog/assessment'} className='links' > <FiBarChart2 className='link-icon' /> Assessment</Link>
        <Link to={'/catalog/certificates'} className='links' > <FiAward className='link-icon' /> Certificates</Link>
        <Link to={'/catalog/timekeeping'} className='links' > <FiClock className='link-icon' /> Timekeeping</Link>
        <Link to={'/catalog/gallery'} className='links' > <FiImage className='link-icon' /> Gallery</Link>
        <Link to={'/catalog/enrollments'} className='links' > <FiClipboard className='link-icon' /> Enrollments</Link>
      </div>


    </aside>
  )
}

export default Sidebar