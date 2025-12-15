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



