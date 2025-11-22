import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login'
import { useAuthStore } from '@/store/authStore'
import * as authApi from '@/api/endpoints/auth'

// Mock dependencies
vi.mock('@/api/endpoints/auth', () => ({
    login: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    )
}

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAuthStore.getState().clearAuth()
        mockNavigate.mockClear()
    })

    it('should render login form with all elements', () => {
        renderLogin()

        expect(screen.getByText('Cyber Academy')).toBeInTheDocument()
        expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    })

    it('should update email input value when user types', () => {
        renderLogin()

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        expect(emailInput.value).toBe('test@example.com')
    })

    it('should update password input value when user types', () => {
        renderLogin()

        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(passwordInput.value).toBe('password123')
    })

    it('should call login API on form submission', async () => {
        const mockLoginResponse = {
            user: {
                id: '123',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                role: 'ADMIN' as const,
            },
            access: 'access-token',
            refresh: 'refresh-token',
        }
        vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
        })
    })

    it('should update auth store on successful login', async () => {
        const mockLoginResponse = {
            user: {
                id: '123',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                role: 'ADMIN' as const,
            },
            access: 'access-token',
            refresh: 'refresh-token',
        }
        vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            const authState = useAuthStore.getState()
            expect(authState.isAuthenticated).toBe(true)
            expect(authState.user?.email).toBe('test@example.com')
            expect(authState.accessToken).toBe('access-token')
        })
    })

    it('should navigate to dashboard on successful login', async () => {
        const mockLoginResponse = {
            user: {
                id: '123',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                role: 'ADMIN' as const,
            },
            access: 'access-token',
            refresh: 'refresh-token',
        }
        vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse)

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('should show loading state during login', async () => {
        vi.mocked(authApi.login).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        )

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        expect(screen.getByText(/signing in/i)).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
    })

    it('should handle login errors gracefully', async () => {
        vi.mocked(authApi.login).mockRejectedValue({
            response: { data: { detail: 'Invalid credentials' } },
        })

        renderLogin()

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalled()
        })

        // Should still show the button after error
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should require email field to be filled', () => {
        renderLogin()

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
        expect(emailInput.required).toBe(true)
    })

    it('should require password field to be filled', () => {
        renderLogin()

        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
        expect(passwordInput.required).toBe(true)
    })

    it('should have forgot password link', () => {
        renderLogin()

        const forgotPasswordLink = screen.getByText(/forgot password/i)
        expect(forgotPasswordLink).toBeInTheDocument()
        expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
    })
})
