import { Outlet, NavLink } from 'react-router-dom'

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const active =
  "bg-background text-foreground shadow-sm"

const AdmissionsWrapper = () => {
  return (
    <div>
      <div className="mb-[2rem] inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        
        <NavLink to="applications" className={({ isActive }) => `${base} ${isActive ? active : ""}`}> Applications </NavLink>
        <NavLink to="enrollments" className={({ isActive }) => `${base} ${isActive ? active : ""}`}> Enrollments </NavLink>

      </div>

      <Outlet />
    </div>
  )
}

export default AdmissionsWrapper