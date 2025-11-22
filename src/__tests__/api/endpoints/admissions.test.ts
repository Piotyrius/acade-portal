import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as admissionsApi from '@/api/endpoints/admissions'
import api from '@/api/client'

// Mock the API client
vi.mock('@/api/client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    },
}))

describe('Admissions API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getApplications', () => {
        it('should call GET with correct endpoint and params', async () => {
            const mockData = { results: [{ id: '1', status: 'PENDING' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockData })

            const result = await admissionsApi.getApplications('program-123', 'PENDING')

            expect(api.get).toHaveBeenCalledWith('/api/v1/admissions/applications/', {
                params: { program: 'program-123', status: 'PENDING' },
            })
            expect(result).toEqual(mockData.results)
        })

        it('should handle response without results wrapper', async () => {
            const mockData = [{ id: '1', status: 'PENDING' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockData })

            const result = await admissionsApi.getApplications()

            expect(result).toEqual(mockData)
        })
    })

    describe('acceptApplication', () => {
        it('should POST with correct payload format', async () => {
            const mockEnrollment = { id: '123', status: 'ACTIVE' }
            vi.mocked(api.post).mockResolvedValue({ data: mockEnrollment })

            const result = await admissionsApi.acceptApplication('app-123', 'cohort-456')

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/admissions/applications/app-123/accept/',
                { cohort_id: 'cohort-456' }
            )
            expect(result).toEqual(mockEnrollment)
        })
    })

    describe('bulkActivateEnrollments', () => {
        it('should POST with enrollments_ids in payload', async () => {
            const mockResponse = { activated: 2, errors: [] }
            vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

            const ids = ['enrollment-1', 'enrollment-2']
            const result = await admissionsApi.bulkActivateEnrollments(ids)

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/admissions/enrollments/bulk_activate/',
                { enrollments_ids: ids }
            )
            expect(result).toEqual(mockResponse)
        })

        it('should handle empty array', async () => {
            const mockResponse = { activated: 0, errors: [] }
            vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

            const result = await admissionsApi.bulkActivateEnrollments([])

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/admissions/enrollments/bulk_activate/',
                { enrollments_ids: [] }
            )
            expect(result.activated).toBe(0)
        })
    })

    describe('getEnrollments', () => {
        it('should apply filters correctly', async () => {
            const mockData = { results: [{ id: '1' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockData })

            await admissionsApi.getEnrollments('cohort-123', 'ACTIVE')

            expect(api.get).toHaveBeenCalledWith('/api/v1/admissions/enrollments/', {
                params: { cohort: 'cohort-123', status: 'ACTIVE' },
            })
        })

        it('should work without filters', async () => {
            const mockData = [{ id: '1' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockData })

            await admissionsApi.getEnrollments()

            expect(api.get).toHaveBeenCalledWith('/api/v1/admissions/enrollments/', {
                params: {},
            })
        })
    })

    describe('activateEnrollment', () => {
        it('should POST with correct payload', async () => {
            const mockEnrollment = { id: '123', status: 'ACTIVE' }
            vi.mocked(api.post).mockResolvedValue({ data: mockEnrollment })

            const payload = { cohort: 'cohort-123', student: 'student-456' }
            const result = await admissionsApi.activateEnrollment('enrollment-123', payload)

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/admissions/enrollments/enrollment-123/activate/',
                payload
            )
            expect(result).toEqual(mockEnrollment)
        })
    })

    describe('submitPublicApplication', () => {
        it('should POST without requiring authentication', async () => {
            const mockApplication = { id: '123', email: 'test@example.com' }
            vi.mocked(api.post).mockResolvedValue({ data: mockApplication })

            const payload = { email: 'test@example.com', firstName: 'John' }
            const result = await admissionsApi.submitPublicApplication(payload)

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/admissions/applications/',
                payload
            )
            expect(result).toEqual(mockApplication)
        })
    })
})
