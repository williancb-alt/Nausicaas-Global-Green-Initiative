import { execSync } from "child_process"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8081"

export interface TestUser {
  email: string
  password: string
}

export async function createTestAdminUser(
  email?: string,
  password: string = "TestPassword123!",
): Promise<TestUser> {
  const testEmail =
    email ||
    `admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`

  try {
    const cmd = `docker compose --profile test run --rm --no-deps -e FLASK_ENV=testing backend-test /app/.venv/bin/python -m flask --app run.py add-user ${testEmail} --admin --password ${password}`

    execSync(cmd, { stdio: "pipe" })

    return { email: testEmail, password }
  } catch (error) {
    console.error("Failed to create admin via CLI:", error)
    throw new Error("Admin creation failed")
  }
}

export async function createTestUser(
  email?: string,
  password: string = "TestPassword123!",
): Promise<TestUser> {
  const testEmail =
    email ||
    `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      email: testEmail,
      password: password,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create test user: ${response.status} ${error}`)
  }

  return { email: testEmail, password }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      email,
      password,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to login user: ${response.status} ${error}`)
  }

  const cookies = response.headers.getSetCookie()
  return cookies
}
