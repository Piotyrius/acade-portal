import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as catalogApi from '@/api/endpoints/catalog'
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

describe('Catalog API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getMyCohorts', () => {
        it('should GET lecturer cohorts from /my/cohorts/ endpoint', async () => {
            const mockCohorts = [{ id: '1', name: 'Cohort 1' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockCohorts })

            const result = await catalogApi.getMyCohorts()

            expect(api.get).toHaveBeenCalledWith('/api/v1/catalog/my/cohorts/')
            expect(result).toEqual(mockCohorts)
        })
    })

    describe('getMySessions', () => {
        it('should GET lecturer sessions from /my/sessions/ endpoint', async () => {
            const mockSessions = [{ id: '1', start_at: '2024-01-01T10:00:00Z' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockSessions })

            const result = await catalogApi.getMySessions({
                date_from: '2024-01-01',
                date_to: '2024-01-31',
            })

            expect(api.get).toHaveBeenCalledWith('/api/v1/catalog/my/sessions/', {
                params: { date_from: '2024-01-01', date_to: '2024-01-31' },
            })
            expect(result).toEqual(mockSessions)
        })

        it('should handle missing date parameters', async () => {
            const mockSessions = [{ id: '1' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockSessions })

            await catalogApi.getMySessions()

            expect(api.get).toHaveBeenCalledWith('/api/v1/catalog/my/sessions/', {
                params: undefined,
            })
        })
    })

    describe('generateSessions', () => {
        it('should POST to generate_sessions endpoint', async () => {
            const mockResponse = { created: 5, sessions: [] }
            vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

            const payload = {
                pattern: 'weekly',
                start_time: '10:00:00',
                end_time: '12:00:00',
            }

            const result = await catalogApi.generateSessions('cohort-123', payload)

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/catalog/cohorts/cohort-123/generate_sessions/',
                payload
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getPrograms', () => {
        it('should GET programs with optional active filter', async () => {
            const mockPrograms = [{ id: '1', name: 'Program 1' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockPrograms })

            const result = await catalogApi.getPrograms({ active: true })

            expect(api.get).toHaveBeenCalledWith('/api/v1/catalog/programs/', {
                params: { active: true },
            })
            expect(result).toEqual(mockPrograms)
        })
    })

    describe('getCohorts', () => {
        it('should GET cohorts with optional course filter', async () => {
            const mockCohorts = [{ id: '1', name: 'Cohort 1' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockCohorts })

            const result = await catalogApi.getCohorts('course-123')

            expect(api.get).toHaveBeenCalledWith('/api/v1/catalog/cohorts/', {
                params: { course: 'course-123' },
            })
            expect(result).toEqual(mockCohorts)
        })
    })
})

