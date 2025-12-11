import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as timekeepingApi from '@/api/endpoints/timekeeping'
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

describe('Timekeeping API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('exportPayroll', () => {
        it('should GET payroll export with trailing slash', async () => {
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
            vi.mocked(api.get).mockResolvedValue({ data: mockBlob })

            const result = await timekeepingApi.exportPayroll('2024-01-01', '2024-01-31')

            expect(api.get).toHaveBeenCalledWith('/api/v1/timekeeping/payroll/export/', {
                params: { from: '2024-01-01', to: '2024-01-31' },
                responseType: 'blob',
            })
            expect(result).toBeInstanceOf(Blob)
        })

        it('should handle missing date parameters', async () => {
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
            vi.mocked(api.get).mockResolvedValue({ data: mockBlob })

            await timekeepingApi.exportPayroll()

            expect(api.get).toHaveBeenCalledWith('/api/v1/timekeeping/payroll/export/', {
                params: { from: undefined, to: undefined },
                responseType: 'blob',
            })
        })
    })

    describe('getWorkLogs', () => {
        it('should GET worklogs with params', async () => {
            const mockWorkLogs = { results: [{ id: '1' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockWorkLogs })

            const result = await timekeepingApi.getWorkLogs({ lecturer: '123' })

            expect(api.get).toHaveBeenCalledWith('/api/v1/timekeeping/worklogs/', {
                params: { lecturer: '123' },
            })
            expect(result).toEqual(mockWorkLogs)
        })
    })

    describe('createWorkLog', () => {
        it('should POST worklog with source MANUAL', async () => {
            const mockWorkLog = { id: '1', lecturer: '123', minutes: 60 }
            vi.mocked(api.post).mockResolvedValue({ data: mockWorkLog })

            const payload = {
                start_at: '2024-01-01T10:00:00Z',
                end_at: '2024-01-01T11:00:00Z',
                lecturer: '123',
                minutes: 60,
            }

            const result = await timekeepingApi.createWorkLog(payload)

            expect(api.post).toHaveBeenCalledWith('/api/v1/timekeeping/worklogs/', {
                ...payload,
                source: 'MANUAL',
            })
            expect(result).toEqual(mockWorkLog)
        })
    })

    describe('getRates', () => {
        it('should GET rates with optional lecturer filter', async () => {
            const mockRates = { results: [{ id: '1', lecturer: '123' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockRates })

            const result = await timekeepingApi.getRates('123')

            expect(api.get).toHaveBeenCalledWith('/api/v1/timekeeping/rates/', {
                params: { lecturer: '123' },
            })
            expect(result).toEqual(mockRates.results || mockRates)
        })
    })

    describe('createRate', () => {
        it('should POST rate with per_hour_minor as number', async () => {
            const mockRate = { id: '1', per_hour_minor: 5000, currency: 'USD' }
            vi.mocked(api.post).mockResolvedValue({ data: mockRate })

            const payload = {
                lecturer: '123',
                per_hour_minor: 5000,
                currency: 'USD',
            }

            const result = await timekeepingApi.createRate(payload)

            expect(api.post).toHaveBeenCalledWith('/api/v1/timekeeping/rates/', payload)
            expect(result).toEqual(mockRate)
        })
    })

    describe('getTimesheets', () => {
        it('should GET timesheets with filters', async () => {
            const mockTimesheets = { results: [{ id: '1' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockTimesheets })

            const result = await timekeepingApi.getTimesheets('123', 'OPEN')

            expect(api.get).toHaveBeenCalledWith('/api/v1/timekeeping/timesheets/', {
                params: { lecturer: '123', status: 'OPEN' },
            })
            expect(result).toEqual(mockTimesheets.results || mockTimesheets)
        })
    })
})

