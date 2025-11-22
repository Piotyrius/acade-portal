import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authApi from '@/api/endpoints/auth'
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

describe('Auth API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('login', () => {
        it('should POST credentials to login endpoint', async () => {
            const mockResponse = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    role: 'ADMIN',
                },
                access: 'access-token',
                refresh: 'refresh-token',
            }
            vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

            const result = await authApi.login('test@example.com', 'password123')

            expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login/', {
                email: 'test@example.com',
                password: 'password123',
            })
            expect(result).toEqual(mockResponse)
            expect(result.user.email).toBe('test@example.com')
            expect(result.access).toBeTruthy()
            expect(result.refresh).toBeTruthy()
        })

        it('should handle login errors', async () => {
            vi.mocked(api.post).mockRejectedValue({
                response: { status: 401, data: { detail: 'Invalid credentials' } },
            })

            await expect(authApi.login('wrong@example.com', 'wrong')).rejects.toThrow()
        })
    })

    describe('fetchMe', () => {
        it('should GET current user data', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                role: 'ADMIN',
            }
            vi.mocked(api.get).mockResolvedValue({ data: mockUser })

            const result = await authApi.fetchMe()

            expect(api.get).toHaveBeenCalledWith('/api/v1/users/me/')
            expect(result).toEqual(mockUser)
        })
    })

    describe('updateProfile', () => {
        it('should PATCH user profile with new data', async () => {
            const mockUpdatedUser = {
                id: '123',
                email: 'test@example.com',
                first_name: 'Jane',
                last_name: 'Smith',
                role: 'ADMIN',
            }
            vi.mocked(api.patch).mockResolvedValue({ data: mockUpdatedUser })

            const updateData = { first_name: 'Jane', last_name: 'Smith' }
            const result = await authApi.updateProfile(updateData)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/users/me_update/', updateData)
            expect(result.first_name).toBe('Jane')
            expect(result.last_name).toBe('Smith')
        })
    })

    describe('requestPasswordReset', () => {
        it('should POST email for password reset', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: {} })

            await authApi.requestPasswordReset('test@example.com')

            expect(api.post).toHaveBeenCalledWith('/api/v1/auth/password_reset/', {
                email: 'test@example.com',
            })
        })

        it('should not throw on successful password reset request', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: {} })

            await expect(authApi.requestPasswordReset('test@example.com')).resolves.not.toThrow()
        })
    })

    describe('getUsers', () => {
        it('should GET all users without role filter', async () => {
            const mockUsers = { results: [{ id: '1' }, { id: '2' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockUsers })

            const result = await authApi.getUsers()

            expect(api.get).toHaveBeenCalledWith('/api/v1/users/', { params: {} })
            expect(result).toEqual(mockUsers.results)
        })

        it('should GET users filtered by role', async () => {
            const mockUsers = [{ id: '1', role: 'STUDENT' }]
            vi.mocked(api.get).mockResolvedValue({ data: mockUsers })

            await authApi.getUsers('STUDENT')

            expect(api.get).toHaveBeenCalledWith('/api/v1/users/', { params: { role: 'STUDENT' } })
        })
    })

    describe('createUser', () => {
        it('should POST new user with all required fields', async () => {
            const newUser = {
                email: 'newuser@example.com',
                password: 'securepass123',
                first_name: 'New',
                last_name: 'User',
                role: 'STUDENT' as const,
            }
            const mockCreatedUser = { ...newUser, id: '456' }
            vi.mocked(api.post).mockResolvedValue({ data: mockCreatedUser })

            const result = await authApi.createUser(newUser)

            expect(api.post).toHaveBeenCalledWith('/api/v1/users/', newUser)
            expect(result.id).toBeTruthy()
            expect(result.email).toBe(newUser.email)
        })
    })

    describe('updateUser', () => {
        it('should PATCH user with partial data', async () => {
            const updateData = { first_name: 'Updated', is_active: false }
            const mockUpdatedUser = { id: '123', ...updateData }
            vi.mocked(api.patch).mockResolvedValue({ data: mockUpdatedUser })

            const result = await authApi.updateUser('123', updateData)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/users/123/', updateData)
            expect(result.first_name).toBe('Updated')
        })
    })

    describe('deleteUser', () => {
        it('should DELETE user by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: {} })

            await authApi.deleteUser('123')

            expect(api.delete).toHaveBeenCalledWith('/api/v1/users/123/')
        })

        it('should not return a value', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: {} })

            const result = await authApi.deleteUser('123')

            expect(result).toBeUndefined()
        })
    })
})
