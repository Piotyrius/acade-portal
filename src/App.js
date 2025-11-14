import { Routes, Route } from 'react-router-dom'
import Sidebar from './layout/Sidebar'
import AppShell from './layout/AppShell';
import { Navigate } from 'react-router-dom';

import { Dashboard } from './pages/dashboard/Dashboard'
import { Programs } from './pages/programs/Programs'
import { Sessions } from './pages/sessions/Sessions'
import { Admissions } from './pages/admissions/Admissions'
import { Assessment } from './pages/assessment/Assessment'
import { Attendance } from './pages/attendance/Attendance'
import { Certificates } from './pages/certificates/Certificates'
import { Cohorts } from './pages/cohorts/Cohorts'
import { Cources } from './pages/cources/Cources'
import { Gallery } from './pages/gallery/Gallery'
import { Timekeeping } from './pages/timekeeping/Timekeeping'

function App() {
  return (
    <>

      <Routes>
        <Route path='/catalog' element={ <AppShell /> }>
          <Route index element={ <Dashboard /> } />
          <Route path='dashboard' element={ <Dashboard /> } />
          <Route path='programs' element={ <Programs /> } />
          <Route path='sessions' element={ <Sessions /> } />
          <Route path='admissions' element={ <Admissions /> } />
          <Route path='assessment' element={ <Assessment /> } />
          <Route path='attendance' element={ <Attendance /> } />
          <Route path='certificates' element={ <Certificates /> } />
          <Route path='cohorts' element={ <Cohorts /> } />
          <Route path='cources' element={ <Cources /> } />
          <Route path='gallery' element={ <Gallery /> } />
          <Route path='timekeeping' element={ <Timekeeping /> } />
        </Route>
        <Route path='*' element={ <Navigate to={'/catalog/dashboard'} /> } />
      </Routes>

    </>
  );
}

export default App;
