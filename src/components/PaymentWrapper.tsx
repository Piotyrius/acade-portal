import { Outlet, NavLink } from 'react-router-dom'

const base =
  "w-full inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const active =
  "bg-background text-foreground shadow-sm"

const PaymentWrapper = () => {
  return (
    <div>
      <div className="mb-[2rem] w-full inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        
        <NavLink to="pricings"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>   Pricing</NavLink>
        <NavLink to="payment-plans"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>  Payment Plans</NavLink>
        <NavLink to="invoices"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>  Invoices</NavLink>
        <NavLink to="payment-schedules"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>  Payment Schedules</NavLink>
        <NavLink to="payment-methods"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>  Payment Methods</NavLink>
        <NavLink to="payments"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>  Payments</NavLink>
        <NavLink to="discounts"  className={({ isActive }) => `${base} ${isActive ? active : ""}`}>  Discounts</NavLink>

      </div>

      <Outlet />
    </div>
  )
}

export default PaymentWrapper
