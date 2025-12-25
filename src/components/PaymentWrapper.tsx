import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const base =
  "w-full inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const active =
  "bg-background text-foreground shadow-sm"

const PaymentWrapper = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <div className="mb-[2rem] w-full inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        <NavLink to="pricings" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Pricing')}</NavLink>
        <NavLink to="payment-plans" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Payment Plans')}</NavLink>
        <NavLink to="invoices" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Invoices')}</NavLink>
        <NavLink to="payment-schedules" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Payment Schedules')}</NavLink>
        <NavLink to="payment-methods" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Payment Methods')}</NavLink>
        <NavLink to="payments" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Payments')}</NavLink>
        <NavLink to="discounts" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>{t('wrappers.Discounts')}</NavLink>

      </div>

      <Outlet />
    </div>
  )
}

export default PaymentWrapper
