import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as galleryApi from '@/api/endpoints/gallery'
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

describe('Gallery API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('uploadProfilePicture', () => {
        it('should POST profile picture without Content-Type header', async () => {
            const mockResponse = { id: '1', profile_picture: 'url' }
            vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

            const file = new File(['image'], 'profile.jpg', { type: 'image/jpeg' })
            const result = await galleryApi.uploadProfilePicture(file)

            // Verify POST was called
            expect(api.post).toHaveBeenCalledWith(
                '/api/v1/users/upload_profile_picture/',
                expect.any(FormData)
            )

            // Verify no explicit Content-Type header was set
            const callArgs = vi.mocked(api.post).mock.calls[0]
            expect(callArgs[2]).toBeUndefined() // No third argument (config with headers)

            expect(result).toEqual(mockResponse)
        })

        it('should send FormData with profile_picture field', async () => {
            const mockResponse = { id: '1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

            const file = new File(['image'], 'profile.jpg')
            await galleryApi.uploadProfilePicture(file)

            const callArgs = vi.mocked(api.post).mock.calls[0]
            const formData = callArgs[1] as FormData
            expect(formData).toBeInstanceOf(FormData)
        })
    })

    describe('uploadWork', () => {
        it('should POST work with FormData', async () => {
            const mockWork = { id: '1', title: 'My Work' }
            vi.mocked(api.post).mockResolvedValue({ data: mockWork })

            const file = new File(['content'], 'work.jpg', { type: 'image/jpeg' })
            const payload = {
                owner: 'user-123',
                title: 'My Work',
                description: 'Description',
                file,
            }

            const result = await galleryApi.uploadWork(payload)

            expect(api.post).toHaveBeenCalledWith('/api/v1/gallery/works/', expect.any(FormData))
            expect(result).toEqual(mockWork)
        })

        it('should set status and is_public in FormData', async () => {
            const mockWork = { id: '1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockWork })

            const file = new File(['content'], 'work.jpg')
            await galleryApi.uploadWork({
                owner: 'user-123',
                title: 'Work',
                file,
            })

            const callArgs = vi.mocked(api.post).mock.calls[0]
            const formData = callArgs[1] as FormData
            expect(formData).toBeInstanceOf(FormData)
        })
    })

    describe('publishWork', () => {
        it('should PATCH work to publish endpoint', async () => {
            const mockWork = { id: '1', status: 'PUBLISHED' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockWork })

            const result = await galleryApi.publishWork('work-123')

            expect(api.patch).toHaveBeenCalledWith('/api/v1/gallery/works/work-123/publish/')
            expect(result).toEqual(mockWork)
        })
    })

    describe('toggleWorkVisibility', () => {
        it('should PATCH work with is_public boolean', async () => {
            const mockWork = { id: '1', is_public: true }
            vi.mocked(api.patch).mockResolvedValue({ data: mockWork })

            const result = await galleryApi.toggleWorkVisibility('work-123', true)

            expect(api.patch).toHaveBeenCalledWith('/api/v1/gallery/works/work-123/', {
                is_public: true,
            })
            expect(result).toEqual(mockWork)
        })
    })
})

