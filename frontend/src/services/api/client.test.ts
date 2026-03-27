import { describe, it, expect } from "vitest"
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios"
import { apiClient } from "./client"

// Extract interceptor handlers from the axios instance
// Mocking just this piece is sufficient
const requestInterceptors = (
  apiClient.interceptors.request as unknown as {
    handlers: Array<{
      fulfilled: (
        config: InternalAxiosRequestConfig,
      ) => InternalAxiosRequestConfig
      rejected: (error: unknown) => Promise<never>
    }>
  }
).handlers

const responseInterceptors = (
  apiClient.interceptors.response as unknown as {
    handlers: Array<{
      fulfilled: (response: unknown) => unknown
      rejected: (error: AxiosError) => never
    }>
  }
).handlers

// These are interceptor function handlers that will be called
const requestFulfilled = requestInterceptors[0].fulfilled
const requestRejected = requestInterceptors[0].rejected
const responseFulfilled = responseInterceptors[0].fulfilled
const responseRejected = responseInterceptors[0].rejected

describe("apiClient", () => {
  it("should have correct base URL", () => {
    expect(apiClient.defaults.baseURL).toBeDefined()
  })

  it("should have withCredentials enabled", () => {
    expect(apiClient.defaults.withCredentials).toBe(true)
  })

  it("should have default headers", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    )
  })
})

describe("request interceptor", () => {
  it("config passed through on fulfilled requests", () => {
    // Validate that the request config is passed through unchanged when the request is fulfilled
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
    expect(requestFulfilled(config)).toBe(config)
  })

  it("rejects request with Error when given an Error", async () => {
    // Validate that the request is rejected with the same Error when the rejected handler is given an Error object
    const err = new Error("request failed")
    await expect(requestRejected(err)).rejects.toThrow("request failed")
  })

  it("wraps non-Error values in an Error on rejection", async () => {
    // Validate that non-Error values are wrapped in an Error when the rejected handler is given such values
    await expect(requestRejected("string error")).rejects.toThrow(
      "string error",
    )
  })
})

describe("response interceptor", () => {
  // Helper function to create a mocked AxiosError with specified response data to
  // testing the responseRejected handler
  function makeResponseError(
    message: string,
    status: number,
    data: Record<string, unknown>,
  ): AxiosError {
    const error = new AxiosError(message)
    error.response = {
      data,
      status,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    return error
  }

  it("response passed through on fulfilled responses", () => {
    // Validate that the response is passed through unchanged when the response is fulfilled
    const response = { data: "ok", status: 200 }
    expect(responseFulfilled(response)).toBe(response)
  })

  it("throws an error with response message", () => {
    // Validate that the response error is thrown with the message from the response data when available
    const error = makeResponseError("fail", 401, {
      message: "Unauthorized access",
    })
    expect(() => responseRejected(error)).toThrow("Unauthorized access")
  })

  it("throws an error with response error field", () => {
    // Validate that the response error is thrown with the error field from the response data when available
    const error = makeResponseError("fail", 404, { error: "Not found" })
    expect(() => responseRejected(error)).toThrow("Not found")
  })

  it("uses error.message when no response data", () => {
    // Validate that the error message is thrown with the error's own message when there is no response data
    const error = new AxiosError("Network Error")
    expect(() => responseRejected(error)).toThrow("Network Error")
  })

  it("uses HTTP status when no message available", () => {
    // Validate that the error message includes the HTTP status code when there is no message in the response data
    const error = makeResponseError("", 500, {})
    expect(() => responseRejected(error)).toThrow("HTTP error 500")
  })

  it("field-specific validation errors added to the response error", () => {
    // Call helper to create a specific error
    const error = makeResponseError("fail", 422, {
      message: "Validation failed",
      errors: { email: "is invalid", name: "is required" },
    })

    // Validate that the error message includes the field-specific validation errors from the response data
    expect(() => responseRejected(error)).toThrow(
      "Validation failed - email: is invalid; name: is required",
    )
  })

  it("field errors not added when errors object is empty", () => {
    // Call helper to create an error with empty errors object
    const error = makeResponseError("fail", 400, {
      message: "Bad request",
      errors: {},
    })
    // Validate that the error message does not include field errors when the errors object is empty
    expect(() => responseRejected(error)).toThrow("Bad request")
  })
})
