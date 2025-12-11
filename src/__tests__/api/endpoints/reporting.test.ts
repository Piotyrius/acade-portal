import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as reportingApi from '@/api/endpoints/reporting'
import * as timekeepingApi from '@/api/endpoints/timekeeping'
import api from '@/api/client'

// Mock timekeeping module
vi.mock('@/api/endpoints/timekeeping', () => ({
    exportPayroll: vi.fn(),
}))

// Mock API client
vi.mock('@/api/client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}))

describe('Reporting API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('exportPayroll', () => {
        it('should redirect to timekeeping exportPayroll', async () => {
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
            vi.mocked(timekeepingApi.exportPayroll).mockResolvedValue(mockBlob)

            const result = await reportingApi.exportPayroll({
                from: '2024-01-01',
                to: '2024-01-31',
            })

            expect(timekeepingApi.exportPayroll).toHaveBeenCalledWith('2024-01-01', '2024-01-31')
            expect(result).toBe(mockBlob)
        })

        it('should handle missing date parameters', async () => {
            const mockBlob = new Blob(['csv,data'])
            vi.mocked(timekeepingApi.exportPayroll).mockResolvedValue(mockBlob)

            await reportingApi.exportPayroll()

            expect(timekeepingApi.exportPayroll).toHaveBeenCalledWith(undefined, undefined)
        })

        it('should ignore lecturer parameter (not used by timekeeping)', async () => {
            const mockBlob = new Blob(['csv,data'])
            vi.mocked(timekeepingApi.exportPayroll).mockResolvedValue(mockBlob)

            await reportingApi.exportPayroll({
                from: '2024-01-01',
                to: '2024-01-31',
                lecturer: 'lect-123',
            })

            // Lecturer param is ignored, only from/to are passed
            expect(timekeepingApi.exportPayroll).toHaveBeenCalledWith('2024-01-01', '2024-01-31')
        })
    })

    describe('exportApplications', () => {
        it('should GET applications export as CSV', async () => {
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
            vi.mocked(api.get).mockResolvedValue({ data: mockBlob })

            const result = await reportingApi.exportApplications({
                from: '2024-01-01',
                to: '2024-01-31',
                program: 'prog-123',
            })

            expect(api.get).toHaveBeenCalledWith('/api/v1/reporting/reports/applications/', {
                params: { from: '2024-01-01', to: '2024-01-31', program: 'prog-123' },
                responseType: 'blob',
            })
            expect(result).toBeInstanceOf(Blob)
        })
    })

    describe('getAnalyticsOverview', () => {
        it('should GET analytics overview with filters', async () => {
            const mockOverview = {
                total_enrollments: 100,
                active_enrollments: 80,
                total_revenue_minor: 50000,
                currency: 'USD',
            }
            vi.mocked(api.get).mockResolvedValue({ data: mockOverview })

            const result = await reportingApi.getAnalyticsOverview({
                date_from: '2024-01-01',
                date_to: '2024-01-31',
                program_id: 'prog-123',
            })

            expect(api.get).toHaveBeenCalledWith('/api/v1/reporting/analytics/overview/', {
                params: {
                    date_from: '2024-01-01',
                    date_to: '2024-01-31',
                    program_id: 'prog-123',
                },
            })
            expect(result).toEqual(mockOverview)
        })
    })

    describe('getFinancialAnalytics', () => {
        it('should GET financial analytics', async () => {
            const mockFinancial = {
                total_revenue_minor: 100000,
                total_outstanding_minor: 20000,
                currency: 'USD',
            }
            vi.mocked(api.get).mockResolvedValue({ data: mockFinancial })

            const result = await reportingApi.getFinancialAnalytics({
                date_from: '2024-01-01',
                date_to: '2024-01-31',
            })

            expect(api.get).toHaveBeenCalledWith('/api/v1/reporting/analytics/financial/', {
                params: { date_from: '2024-01-01', date_to: '2024-01-31' },
            })
            expect(result).toEqual(mockFinancial)
        })
    })
})

