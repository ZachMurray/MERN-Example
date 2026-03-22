import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import '../styles/Dashboard.css'

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile()
        setUser(response.data.user)
      } catch (err) {
        setError('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (loading) {
    return <div className="dashboard-container">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome to Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {user && (
          <div className="user-info">
            <h2>Your Profile</h2>
            <div className="info-item">
              <span className="label">Username:</span>
              <span className="value">{user.username}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Member Since:</span>
              <span className="value">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
