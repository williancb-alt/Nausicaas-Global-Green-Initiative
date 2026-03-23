import { describe, it, expect, vi, beforeEach } from "vitest"
import { authApi } from "./auth"
import { apiClient, BaseResponse, UserInfo } from "./client"

const mockedPost = vi.spyOn(apiClient, "post")
const mockedGet = vi.spyOn(apiClient, "get")

const createSuccessResponse = (message: string): BaseResponse => ({
  status: "success",
  message,
})

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    {
      name: "register",
      mock: () => mockedPost,
      response: createSuccessResponse("registered"),
      execute: () => authApi.register("test@example.com", "password123"),
      expectedArgs: ["/api/v1/auth/register", expect.any(URLSearchParams)],
    },
    {
      name: "login",
      mock: () => mockedPost,
      response: createSuccessResponse("logged in"),
      execute: () => authApi.login("test@example.com", "password123"),
      expectedArgs: ["/api/v1/auth/login", expect.any(URLSearchParams)],
    },
    {
      name: "getUser",
      mock: () => mockedGet,
      response: {
        email: "test@example.com",
        admin: false,
        public_id: "user-123",
      } as UserInfo,
      execute: () => authApi.getUser(),
      expectedArgs: ["/api/v1/auth/user"],
    },
    {
      name: "logout",
      mock: () => mockedPost,
      response: createSuccessResponse("logged out"),
      execute: () => authApi.logout(),
      expectedArgs: ["/api/v1/auth/logout"],
    },
    {
      name: "forgotPassword",
      mock: () => mockedPost,
      response: createSuccessResponse("email sent"),
      execute: () => authApi.forgotPassword("test@example.com"),
      expectedArgs: [
        "/api/v1/auth/forgot-password",
        expect.any(URLSearchParams),
      ],
    },
    {
      name: "resetPassword",
      mock: () => mockedPost,
      response: createSuccessResponse("password reset"),
      execute: () => authApi.resetPassword("token-123", "newpassword"),
      expectedArgs: [
        "/api/v1/auth/reset-password",
        expect.any(URLSearchParams),
      ],
    },
  ])(
    "should call $name endpoint",
    async ({ mock, response, execute, expectedArgs }) => {
      mock().mockResolvedValueOnce({ data: response })

      const result = await execute()
      expect(result).toEqual(response)
      expect(mock()).toHaveBeenCalledWith(...expectedArgs)
    },
  )
})
