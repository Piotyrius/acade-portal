import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppShell = () => {
  return (
    <section className='app_shell_wrapper'>
      <Sidebar />
      <div className='nabar__outlet_wrapper'>
        <Navbar />
        <div>
          <Outlet />
        </div>
      </div>
    </section>
  )
}

export default AppShell