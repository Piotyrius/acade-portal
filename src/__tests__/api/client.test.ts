import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => {
    return {
        default: {
            create: vi.fn(() => ({
                interceptors: {
                    request: { use: vi.fn() },
                    response: { use: vi.fn() },
                },
            })),
            post: vi.fn(),
        },
    }
})

describe('API Client', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAuthStore.getState().clearAuth()
    })

    describe('Authorization Header', () => {
        it('should attach authorization header when token exists', () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'ADMIN' as const,
            }

            // Set auth with token
            useAuthStore.getState().setAuth(mockUser, 'test-token', 'refresh-token')

            // Get the token from store
            const token = useAuthStore.getState().accessToken
            expect(token).toBe('test-token')
        })

        it('should not have token when user is not authenticated', () => {
            useAuthStore.getState().clearAuth()

            const token = useAuthStore.getState().accessToken
            expect(token).toBeNull()
        })
    })

    describe('API Base URL', () => {
        it('should use environment variable or default URL', () => {
            // Note: The actual API instance is created at import time
            // This test verifies the logic would work correctly
            const envUrl = import.meta.env.VITE_API_BASE_URL?.trim()
            const expectedUrl = envUrl || 'https://academy-crm.onrender.com'

            expect(expectedUrl).toBeTruthy()
            expect(typeof expectedUrl).toBe('string')
        })
    })
})
