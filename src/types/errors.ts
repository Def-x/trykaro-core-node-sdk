// @defx/storefront-core

/**
 * Base error class for all Storefront SDK operations.
 */
export class StorefrontError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorefrontError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when an API request fails with an HTTP error status code.
 */
export class StorefrontApiError extends StorefrontError {
  public status: number;
  public endpoint?: string;
  public data?: unknown;

  constructor(message: string, status: number, endpoint?: string, data?: unknown) {
    super(message);
    this.name = "StorefrontApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when an operation requires user authentication but no valid token is provided.
 */
export class StorefrontAuthError extends StorefrontError {
  constructor(message = "Unauthorized: A valid auth token is required for this operation.") {
    super(message);
    this.name = "StorefrontAuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

