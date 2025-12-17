import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as paymentsApi from '@/api/endpoints/payments'
import api from '@/api/client'

// Mock the API client
vi.mock('@/api/client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}))

describe('Payments API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Discounts', () => {
        it('getDiscounts should GET with params and unwrap results', async () => {
            const mockDiscounts = [{ id: 'd1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockDiscounts } })

            const result = await paymentsApi.getDiscounts({ is_active: true, page: 2 })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/discounts/', {
                params: { is_active: true, page: 2 },
            })
            expect(result).toEqual(mockDiscounts)
        })

        it('getDiscounts should return plain array when backend is not paginated', async () => {
            const mockDiscounts = [{ id: 'd1' }, { id: 'd2' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockDiscounts })

            const result = await paymentsApi.getDiscounts()

            expect(result).toEqual(mockDiscounts)
        })

        it('getDiscount should GET by id', async () => {
            const mockDiscount = { id: 'd1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockDiscount })

            const result = await paymentsApi.getDiscount('d1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/discounts/d1/')
            expect(result).toEqual(mockDiscount)
        })

        it('updateDiscount should PATCH by id', async () => {
            const mockDiscount = { id: 'd1', name: 'Updated' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockDiscount })

            const result = await paymentsApi.updateDiscount('d1', { name: 'Updated' })

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/discounts/d1/', {
                name: 'Updated',
            })
            expect(result).toEqual(mockDiscount)
        })

        it('deleteDiscount should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deleteDiscount('d1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/discounts/d1/')
        })
    })

    describe('Invoices', () => {
        it('getInvoices should GET with params and unwrap results', async () => {
            const mockInvoices = [{ id: 'i1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockInvoices } })

            const result = await paymentsApi.getInvoices({ status: 'ISSUED', page: 3 })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/invoices/', {
                params: { status: 'ISSUED', page: 3 },
            })
            expect(result).toEqual(mockInvoices)
        })

        it('getInvoice should GET by id', async () => {
            const mockInvoice = { id: 'i1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockInvoice })

            const result = await paymentsApi.getInvoice('i1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/invoices/i1/')
            expect(result).toEqual(mockInvoice)
        })

        it('createInvoice should POST payload', async () => {
            const mockInvoice = { id: 'i1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockInvoice })

            const payload = {
                enrollment: 'enr-1',
                subtotal: '100.00',
                total_amount: '100.00',
                due_date: '2025-01-01',
            }

            const result = await paymentsApi.createInvoice(payload as any)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/invoices/', payload)
            expect(result).toEqual(mockInvoice)
        })

        it('updateInvoice should PATCH by id', async () => {
            const mockInvoice = { id: 'i1', notes: 'Updated' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockInvoice })

            const result = await paymentsApi.updateInvoice('i1', { notes: 'Updated' } as any)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/invoices/i1/', {
                notes: 'Updated',
            })
            expect(result).toEqual(mockInvoice)
        })

        it('deleteInvoice should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deleteInvoice('i1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/invoices/i1/')
        })
    })

    describe('Payment Methods', () => {
        it('getPaymentMethods should GET with params and unwrap results', async () => {
            const mockMethods = [{ id: 'pm1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockMethods } })

            const result = await paymentsApi.getPaymentMethods({ is_active: true })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payment-methods/', {
                params: { is_active: true },
            })
            expect(result).toEqual(mockMethods)
        })

        it('getPaymentMethod should GET by id', async () => {
            const mockMethod = { id: 'pm1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockMethod })

            const result = await paymentsApi.getPaymentMethod('pm1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payment-methods/pm1/')
            expect(result).toEqual(mockMethod)
        })

        it('createPaymentMethod should POST payload', async () => {
            const mockMethod = { id: 'pm1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockMethod })

            const payload = { name: 'Cash', is_active: true }

            const result = await paymentsApi.createPaymentMethod(payload as any)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/payment-methods/', payload)
            expect(result).toEqual(mockMethod)
        })

        it('updatePaymentMethod should PATCH by id', async () => {
            const mockMethod = { id: 'pm1', name: 'Updated' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockMethod })

            const result = await paymentsApi.updatePaymentMethod('pm1', { name: 'Updated' } as any)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/payment-methods/pm1/', {
                name: 'Updated',
            })
            expect(result).toEqual(mockMethod)
        })

        it('deletePaymentMethod should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deletePaymentMethod('pm1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/payment-methods/pm1/')
        })
    })

    describe('Payment Plans', () => {
        it('getPaymentPlans should GET with params and unwrap results', async () => {
            const mockPlans = [{ id: 'pp1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockPlans } })

            const result = await paymentsApi.getPaymentPlans({ type: 'MONTHLY', page: 1 })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payment-plans/', {
                params: { type: 'MONTHLY', page: 1 },
            })
            expect(result).toEqual(mockPlans)
        })

        it('getPaymentPlan should GET by id', async () => {
            const mockPlan = { id: 'pp1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockPlan })

            const result = await paymentsApi.getPaymentPlan('pp1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payment-plans/pp1/')
            expect(result).toEqual(mockPlan)
        })

        it('createPaymentPlan should POST payload', async () => {
            const mockPlan = { id: 'pp1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockPlan })

            const payload = { name: 'Monthly', type: 'MONTHLY' }

            const result = await paymentsApi.createPaymentPlan(payload as any)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/payment-plans/', payload)
            expect(result).toEqual(mockPlan)
        })

        it('updatePaymentPlan should PATCH by id', async () => {
            const mockPlan = { id: 'pp1', is_active: false }
            vi.mocked(api.patch).mockResolvedValue({ data: mockPlan })

            const result = await paymentsApi.updatePaymentPlan('pp1', { is_active: false } as any)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/payment-plans/pp1/', {
                is_active: false,
            })
            expect(result).toEqual(mockPlan)
        })

        it('deletePaymentPlan should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deletePaymentPlan('pp1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/payment-plans/pp1/')
        })

        it('deletePaymentPlan should fallback to underscore route on 404', async () => {
            vi.mocked(api.delete)
                .mockRejectedValueOnce({ response: { status: 404 } })
                .mockResolvedValueOnce({ data: undefined } as any)

            await paymentsApi.deletePaymentPlan('pp1')

            expect(api.delete).toHaveBeenNthCalledWith(1, '/api/v1/payments/payment-plans/pp1/')
            expect(api.delete).toHaveBeenNthCalledWith(2, '/api/v1/payments/payment_plans/pp1/')
        })
    })

    describe('Payment Schedules', () => {
        it('getPaymentSchedules should GET with params and unwrap results', async () => {
            const mockSchedules = [{ id: 'ps1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockSchedules } })

            const result = await paymentsApi.getPaymentSchedules({ status: 'PENDING', invoice: 'inv-1' })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payment-schedules/', {
                params: { status: 'PENDING', invoice: 'inv-1' },
            })
            expect(result).toEqual(mockSchedules)
        })

        it('getPaymentSchedule should GET by id', async () => {
            const mockSchedule = { id: 'ps1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockSchedule })

            const result = await paymentsApi.getPaymentSchedule('ps1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payment-schedules/ps1/')
            expect(result).toEqual(mockSchedule)
        })

        it('createPaymentSchedule should POST payload', async () => {
            const mockSchedule = { id: 'ps1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockSchedule })

            const payload = { invoice: 'inv-1', scheduled_date: '2025-01-01', amount: '50.00' }

            const result = await paymentsApi.createPaymentSchedule(payload)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/payment-schedules/', payload)
            expect(result).toEqual(mockSchedule)
        })

        it('updatePaymentSchedule should PATCH by id', async () => {
            const mockSchedule = { id: 'ps1', status: 'PAID' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockSchedule })

            const result = await paymentsApi.updatePaymentSchedule('ps1', { amount: '60.00' } as any)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/payment-schedules/ps1/', {
                amount: '60.00',
            })
            expect(result).toEqual(mockSchedule)
        })

        it('deletePaymentSchedule should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deletePaymentSchedule('ps1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/payment-schedules/ps1/')
        })

        it('markPaymentSchedulesOverdue should POST and return count', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: { marked_overdue: 3 } })

            const result = await paymentsApi.markPaymentSchedulesOverdue()

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/payment-schedules/mark_overdue/')
            expect(result).toEqual({ marked_overdue: 3 })
        })
    })

    describe('Payments', () => {
        it('getPayments should GET with params and unwrap results', async () => {
            const mockPayments = [{ id: 'p1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockPayments } })

            const result = await paymentsApi.getPayments({ status: 'COMPLETED', page: 2 })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payments/', {
                params: { status: 'COMPLETED', page: 2 },
            })
            expect(result).toEqual(mockPayments)
        })

        it('getPayment should GET by id', async () => {
            const mockPayment = { id: 'p1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockPayment })

            const result = await paymentsApi.getPayment('p1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/payments/p1/')
            expect(result).toEqual(mockPayment)
        })

        it('createPayment should POST payload', async () => {
            const mockPayment = { id: 'p1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockPayment })

            const payload = {
                amount: '100.00',
                currency: 'USD',
                payment_method: 'CASH',
                payment_gateway: 'MANUAL',
                status: 'PENDING',
                payment_date: '2025-01-01T00:00:00Z',
                invoice: 'inv-1',
                student: 'stu-1',
                organization: 'org-1',
                recorded_by: 'admin-1',
                processed_at: '2025-01-01T00:00:00Z',
            }

            const result = await paymentsApi.createPayment(payload as any)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/payments/', payload)
            expect(result).toEqual(mockPayment)
        })

        it('updatePayment should PATCH by id', async () => {
            const mockPayment = { id: 'p1', notes: 'Updated' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockPayment })

            const result = await paymentsApi.updatePayment('p1', { notes: 'Updated' } as any)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/payments/p1/', {
                notes: 'Updated',
            })
            expect(result).toEqual(mockPayment)
        })

        it('deletePayment should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deletePayment('p1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/payments/p1/')
        })
    })

    describe('Pricings', () => {
        it('getPricings should GET with params and unwrap results', async () => {
            const mockPricings = [{ id: 'pr1' }]
            vi.mocked(api.get).mockResolvedValue({ data: { results: mockPricings } })

            const result = await paymentsApi.getPricings({ object_id: 'obj-1', is_active: true })

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/pricings/', {
                params: { object_id: 'obj-1', is_active: true },
            })
            expect(result).toEqual(mockPricings)
        })

        it('getPricing should GET by id', async () => {
            const mockPricing = { id: 'pr1' }
            vi.mocked(api.get).mockResolvedValue({ data: mockPricing })

            const result = await paymentsApi.getPricing('pr1')

            expect(api.get).toHaveBeenCalledWith('/api/v1/payments/pricings/pr1/')
            expect(result).toEqual(mockPricing)
        })

        it('createPricing should POST payload', async () => {
            const mockPricing = { id: 'pr1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockPricing })

            const payload = {
                object_id: 'obj-1',
                content_type: 1,
                amount: '100.00',
                currency: 'USD',
                effective_from: '2025-01-01',
            }

            const result = await paymentsApi.createPricing(payload as any)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/pricings/', payload)
            expect(result).toEqual(mockPricing)
        })

        it('updatePricing should PATCH by id', async () => {
            const mockPricing = { id: 'pr1', is_active: false }
            vi.mocked(api.patch).mockResolvedValue({ data: mockPricing })

            const result = await paymentsApi.updatePricing('pr1', { is_active: false } as any)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/payments/pricings/pr1/', {
                is_active: false,
            })
            expect(result).toEqual(mockPricing)
        })

        it('deletePricing should DELETE by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: undefined } as any)
            await paymentsApi.deletePricing('pr1')
            expect(api.delete).toHaveBeenCalledWith('/api/v1/payments/pricings/pr1/')
        })

        it('deletePricing should fallback to singular route on 404', async () => {
            vi.mocked(api.delete)
                .mockRejectedValueOnce({ response: { status: 404 } })
                .mockResolvedValueOnce({ data: undefined } as any)

            await paymentsApi.deletePricing('pr1')

            expect(api.delete).toHaveBeenNthCalledWith(1, '/api/v1/payments/pricings/pr1/')
            expect(api.delete).toHaveBeenNthCalledWith(2, '/api/v1/payments/pricing/pr1/')
        })
    })

    describe('recordPayment', () => {
        it('should POST simplified RecordPaymentRequest payload', async () => {
            const mockPayment = { id: '1', amount: '100.00', invoice: 'inv-123' }
            vi.mocked(api.post).mockResolvedValue({ data: mockPayment })

            const payload: paymentsApi.RecordPaymentRequest = {
                invoice: 'inv-123',
                amount: '100.00',
                payment_method: 'CASH',
                notes: 'Test payment',
            }

            const result = await paymentsApi.recordPayment(payload)

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/payments/record_payment/',
                payload
            )
            expect(result).toEqual(mockPayment)
        })

        it('should handle optional fields', async () => {
            const mockPayment = { id: '1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockPayment })

            await paymentsApi.recordPayment({
                invoice: 'inv-123',
                amount: '100.00',
            })

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/payments/record_payment/',
                {
                    invoice: 'inv-123',
                    amount: '100.00',
                }
            )
        })
    })

    describe('createInvoiceForEnrollment', () => {
        it('should POST with enrollment, payment_plan, and optional discounts', async () => {
            const mockInvoice = { id: '1', enrollment: 'enr-123' }
            vi.mocked(api.post).mockResolvedValue({ data: mockInvoice })

            const result = await paymentsApi.createInvoiceForEnrollment(
                'enr-123',
                'plan-123',
                ['disc-1', 'disc-2']
            )

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/invoices/create_for_enrollment/',
                {
                    enrollment: 'enr-123',
                    payment_plan: 'plan-123',
                    discounts: ['disc-1', 'disc-2'],
                }
            )
            expect(result).toEqual(mockInvoice)
        })

        it('should handle missing discounts', async () => {
            const mockInvoice = { id: '1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockInvoice })

            await paymentsApi.createInvoiceForEnrollment('enr-123', 'plan-123')

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/invoices/create_for_enrollment/',
                {
                    enrollment: 'enr-123',
                    payment_plan: 'plan-123',
                }
            )
        })

        it('should handle empty discounts array', async () => {
            const mockInvoice = { id: '1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockInvoice })

            await paymentsApi.createInvoiceForEnrollment('enr-123', 'plan-123', [])

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/invoices/create_for_enrollment/',
                {
                    enrollment: 'enr-123',
                    payment_plan: 'plan-123',
                }
            )
        })
    })

    describe('getInvoiceOutstandingBalance', () => {
        it('should GET and return correct response structure', async () => {
            const mockResponse = {
                invoice_number: 'INV-001',
                total_amount: '1000.00',
                paid_amount: '500.00',
                outstanding_amount: '500.00',
                status: 'PARTIAL',
            }
            vi.mocked(api.get).mockResolvedValue({ data: mockResponse })

            const result = await paymentsApi.getInvoiceOutstandingBalance('inv-123')

            expect(api.get).toHaveBeenCalledWith(
                '/api/v1/payments/invoices/inv-123/outstanding_balance/'
            )
            expect(result).toEqual(mockResponse)
            expect(result).toHaveProperty('invoice_number')
            expect(result).toHaveProperty('outstanding_amount')
            expect(result).toHaveProperty('status')
        })
    })

    describe('applyDiscountsToInvoice', () => {
        it('should POST discount_ids array', async () => {
            const mockInvoice = { id: '1', discount_amount: '50.00' }
            vi.mocked(api.post).mockResolvedValue({ data: mockInvoice })

            const result = await paymentsApi.applyDiscountsToInvoice('inv-123', [
                'disc-1',
                'disc-2',
            ])

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/invoices/inv-123/apply_discounts/',
                { discount_ids: ['disc-1', 'disc-2'] }
            )
            expect(result).toEqual(mockInvoice)
        })
    })

    describe('issueInvoice', () => {
        it('should POST to issue endpoint', async () => {
            const mockInvoice = { id: '1', status: 'ISSUED' }
            vi.mocked(api.post).mockResolvedValue({ data: mockInvoice })

            const result = await paymentsApi.issueInvoice('inv-123')

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/invoices/inv-123/issue/')
            expect(result).toEqual(mockInvoice)
        })
    })

    describe('processRefund', () => {
        it('should POST refund with amount and reason', async () => {
            const mockPayment = { id: '1', status: 'REFUNDED' }
            vi.mocked(api.post).mockResolvedValue({ data: mockPayment })

            const result = await paymentsApi.processRefund('pay-123', {
                amount: '50.00',
                reason: 'Customer request',
            })

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/payments/payments/pay-123/process_refund/',
                { amount: '50.00', reason: 'Customer request' }
            )
            expect(result).toEqual(mockPayment)
        })
    })

    describe('createDiscount', () => {
        it('should POST discount with decimal string amounts', async () => {
            const mockDiscount = { id: '1', value: '10.00', type: 'PERCENTAGE' }
            vi.mocked(api.post).mockResolvedValue({ data: mockDiscount })

            const payload = {
                name: 'Test Discount',
                type: 'PERCENTAGE' as const,
                value: '10.00', // Decimal string
                applicable_to: 'FULL_PAYMENT' as const,
                valid_from: '2024-01-01',
            }

            const result = await paymentsApi.createDiscount(payload)

            expect(api.post).toHaveBeenCalledWith('/api/v1/payments/discounts/', payload)
            expect(result).toEqual(mockDiscount)
        })
    })
})



