import { useState } from 'react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    async function handleLogin(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        setError('')
        setMessage('')
        setIsSubmitting(true)

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                const message = Array.isArray(data.message)
                    ? data.message.join(', ')
                    : data.message

                setError(message || 'Đăng nhập thất bại')
                return
            }

            setMessage(`Đăng nhập thành công. Xin chào ${data.user.name}!`)
            setPassword('')
        } catch {
            setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }
    async function handleCheckAccount() {
  setError('')
  setMessage('')

  try {
    const response = await fetch('http://localhost:3000/auth/me', {
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.message || 'Không thể lấy thông tin tài khoản')
      return
    }

    setMessage(`JWT hợp lệ. Tài khoản hiện tại: ${data.name}`)
  } catch {
    setError('Không thể kết nối đến máy chủ')
  }
}
   return (
  <main>
    <h1>Đăng nhập Booking Room</h1>

    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
      <button type="button" onClick={handleCheckAccount}>
  Kiểm tra tài khoản
</button>
    </form>
  </main>
)
}