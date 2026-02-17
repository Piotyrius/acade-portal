import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/store/authStore'

describe('authStore', () => {
    beforeEach(() => {
        // Clear store before each test
        useAuthStore.getState().clearAuth()
        vi.clearAllMocks()
    })

    describe('setAuth', () => {
        it('should set user, tokens, and isAuthenticated to true', () => {
            const mockUser: User = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'ADMIN',
            }
            const accessToken = 'access-token-123'
            const refreshToken = 'refresh-token-123'

            useAuthStore.getState().setAuth(mockUser, accessToken, refreshToken)

            const state = useAuthStore.getState()
            expect(state.user).toEqual(mockUser)
            expect(state.accessToken).toBe(accessToken)
            expect(state.refreshToken).toBe(refreshToken)
            expect(state.isAuthenticated).toBe(true)
        })

        it('should set isAuthenticated to true only when both user and accessToken exist', () => {
            const mockUser: User = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'ADMIN',
            }

            useAuthStore.getState().setAuth(mockUser, 'token', 'refresh')
            expect(useAuthStore.getState().isAuthenticated).toBe(true)
        })
    })

    describe('clearAuth', () => {
        it('should clear all auth data', () => {
            const mockUser: User = {
                id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'ADMIN',
            }

            // First set auth
            useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token')
            expect(useAuthStore.getState().isAuthenticated).toBe(true)

            // Then clear
            useAuthStore.getState().clearAuth()

            const state = useAuthStore.getState()
            expect(state.user).toBeNull()
            expect(state.accessToken).toBeNull()
            expect(state.refreshToken).toBeNull()
            expect(state.isAuthenticated).toBe(false)
        })
    })

    describe('initial state', () => {
        it('should have null values and isAuthenticated false', () => {
            useAuthStore.getState().clearAuth()

            const state = useAuthStore.getState()
            expect(state.user).toBeNull()
            expect(state.accessToken).toBeNull()
            expect(state.refreshToken).toBeNull()
            expect(state.isAuthenticated).toBe(false)
        })
    })
})
