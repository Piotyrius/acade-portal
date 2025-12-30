import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as subscriptionsApi from '@/api/endpoints/subscriptions'
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

describe('Subscriptions API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createNewSubscription', () => {
        it('should POST to create_subscription endpoint (not create_new)', async () => {
            const mockSubscription = {
                id: '1',
                organization: 'org-123',
                plan: 'plan-123',
                status: 'ACTIVE',
            }
            vi.mocked(api.post).mockResolvedValue({ data: mockSubscription })

            const payload = {
                plan_id: 'plan-123',
                organization_id: 'org-123',
            }

            const result = await subscriptionsApi.createNewSubscription(payload)

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/subscriptions/subscriptions/create_subscription/',
                payload
            )
            expect(result).toEqual(mockSubscription)
        })

        it('should handle optional organization_id', async () => {
            const mockSubscription = { id: '1', plan: 'plan-123' }
            vi.mocked(api.post).mockResolvedValue({ data: mockSubscription })

            await subscriptionsApi.createNewSubscription({ plan_id: 'plan-123' })

            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/subscriptions/subscriptions/create_subscription/',
                { plan_id: 'plan-123' }
            )
        })
    })

    describe('getMySubscription', () => {
        it('should GET my subscription from /my/ endpoint', async () => {
            const mockSubscription = { id: '1', status: 'ACTIVE' }
            vi.mocked(api.get).mockResolvedValue({ data: mockSubscription })

            const result = await subscriptionsApi.getMySubscription()

            expect(api.get).toHaveBeenCalledWith('/api/v1/subscriptions/subscriptions/my/')
            expect(result).toEqual(mockSubscription)
        })
    })

    describe('getOrganizations', () => {
        it('should GET organizations list', async () => {
            const mockOrgs = { results: [{ id: '1', name: 'Org 1' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockOrgs })

            const result = await subscriptionsApi.getOrganizations()

            expect(api.get).toHaveBeenCalledWith('/api/v1/subscriptions/organizations/')
            expect(result).toEqual(mockOrgs.results || mockOrgs)
        })
    })

    describe('getAvailablePlans', () => {
        it('should GET available plans from /available/ endpoint', async () => {
            const mockPlans = [{ id: '1', name: 'Plan 1' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockPlans })

            const result = await subscriptionsApi.getAvailablePlans()

            expect(api.get).toHaveBeenCalledWith('/api/v1/subscriptions/plans/available/')
            expect(result).toEqual(mockPlans)
        })
    })

    describe('getFeatureStatus', () => {
        it('should GET feature status', async () => {
            const mockStatus = {
                organization_id: 'org-123',
                has_subscription: true,
                is_active: true,
                enabled_modules: ['payments'],
            }
            vi.mocked(api.get).mockResolvedValue({ data: mockStatus })

            const result = await subscriptionsApi.getFeatureStatus()

            expect(api.get).toHaveBeenCalledWith('/api/v1/subscriptions/features/status/')
            expect(result).toEqual(mockStatus)
        })
    })
})




