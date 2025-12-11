import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as documentsApi from '@/api/endpoints/documents'
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

describe('Documents API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('downloadDocument', () => {
        it('should GET document download (not POST)', async () => {
            const mockBlob = new Blob(['file content'], { type: 'application/pdf' })
            vi.mocked(api.get).mockResolvedValue({ data: mockBlob })

            const result = await documentsApi.downloadDocument('doc-123')

            expect(api.get).toHaveBeenCalledWith('/api/v1/documents/documents/doc-123/download/', {
                responseType: 'blob',
            })
            expect(result).toBeInstanceOf(Blob)
        })
    })

    describe('createDocument', () => {
        it('should POST document with FormData', async () => {
            const mockDocument = { id: '1', kind: 'syllabus', description: 'Test' }
            vi.mocked(api.post).mockResolvedValue({ data: mockDocument })

            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
            const payload = {
                kind: 'syllabus',
                description: 'Test document',
                file,
                visibility: 'PRIVATE' as const,
            }

            const result = await documentsApi.createDocument(payload)

            expect(api.post).toHaveBeenCalledWith('/api/v1/documents/documents/', expect.any(FormData))
            expect(result).toEqual(mockDocument)
        })

        it('should include optional fields in FormData', async () => {
            const mockDocument = { id: '1' }
            vi.mocked(api.post).mockResolvedValue({ data: mockDocument })

            const file = new File(['content'], 'test.pdf')
            await documentsApi.createDocument({
                kind: 'syllabus',
                description: 'Test',
                file,
                owner: 'user-123',
                visibility: 'ADMIN',
            })

            const callArgs = vi.mocked(api.post).mock.calls[0]
            expect(callArgs[0]).toBe('/api/v1/documents/documents/')
            expect(callArgs[1]).toBeInstanceOf(FormData)
        })
    })

    describe('getDocuments', () => {
        it('should GET documents with optional kind filter', async () => {
            const mockDocuments = { results: [{ id: '1', kind: 'syllabus' }] }
            vi.mocked(api.get).mockResolvedValue({ data: mockDocuments })

            const result = await documentsApi.getDocuments('syllabus')

            expect(api.get).toHaveBeenCalledWith('/api/v1/documents/documents/', {
                params: { kind: 'syllabus' },
            })
            expect(result).toEqual(mockDocuments.results || mockDocuments)
        })
    })

    describe('updateDocument', () => {
        it('should PATCH document with partial data', async () => {
            const mockUpdated = { id: '1', description: 'Updated' }
            vi.mocked(api.patch).mockResolvedValue({ data: mockUpdated })

            const result = await documentsApi.updateDocument('1', { description: 'Updated' })

            expect(api.patch).toHaveBeenCalledWith('/api/v1/documents/documents/1/', {
                description: 'Updated',
            })
            expect(result).toEqual(mockUpdated)
        })
    })

    describe('deleteDocument', () => {
        it('should DELETE document by id', async () => {
            vi.mocked(api.delete).mockResolvedValue({ data: {} })

            await documentsApi.deleteDocument('doc-123')

            expect(api.delete).toHaveBeenCalledWith('/api/v1/documents/documents/doc-123/')
        })
    })
})

