import React, { useState, JSX } from "react"
import { api, Grant } from "../services/api"
import { Button } from "../components/button/Button"

export function Home(): JSX.Element {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // This will need to handled in a secure manner
  const [token, setToken] = useState("")
  const [grants, setGrants] = useState<Grant[]>([])
  const [grantName, setGrantName] = useState("")
  const [grantDeadline, setGrantDeadline] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requireToken = () => {
    if (!token) throw new Error("Log in first to get a token")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const auth = await api.login(email, password)
      setToken(auth.access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      requireToken()
      await api.createGrant(token, { name: grantName, deadline: grantDeadline })
      const page = await api.listGrants(token, 1, 5)
      setGrants(page.items)
      setGrantName("")
      setGrantDeadline("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create grant failed")
    } finally {
      setLoading(false)
    }
  }

  const handleListGrants = async () => {
    setLoading(true)
    setError(null)
    try {
      requireToken()
      const page = await api.listGrants(token, 1, 5)
      setGrants(page.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch grants failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Grants Test UI</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title">1) Login (get token)</h2>
          <form onSubmit={handleLogin} className="mt-3">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          {token && (
            <div className="alert alert-success mt-3 mb-0">
              Token acquired. You can create and list grants now.
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title">2) Create Grant</h2>
          <form onSubmit={handleCreateGrant} className="mt-3">
            <div className="mb-3">
              <label className="form-label">Grant Name</label>
              <input
                type="text"
                value={grantName}
                onChange={e => setGrantName(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Deadline (DD/MM/YYYY)</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={grantDeadline}
                onChange={e => setGrantDeadline(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <Button type="submit" disabled={loading} variant="success">
              {loading ? "Creating..." : "Create Grant"}
            </Button>
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3">
            <h2 className="h5 card-title mb-0">3) List Grants</h2>
            <Button
              onClick={handleListGrants}
              disabled={loading}
              variant="info"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {grants.length > 0 ? (
            <ul className="list-group">
              {grants.map(g => (
                <li key={g.name} className="list-group-item">
                  <div className="fw-semibold">{g.name}</div>
                  {g.deadline && (
                    <div className="text-muted small">
                      Deadline: {g.deadline}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">No grants loaded.</p>
          )}
        </div>
      </div>
    </div>
  )
}
