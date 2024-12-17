export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  data?: Record<string, any>
  params?: Record<string, any>
}

export interface HttpResponse<T = any> {
  status: number
  statusText: string
  data: T
}

export class HttpClient {
  static baseURL: string = ''
  static defaultHeaders: Record<string, string> = {}

  /**
   * Set the base URL for all requests.
   * @param {string} url
   */
  static setBaseURL(url: string): void {
    HttpClient.baseURL = url
  }

  /**
   * Set default headers for all requests.
   * @param {Record<string, string>} headers
   */
  static setDefaultHeaders(headers: Record<string, string>): void {
    HttpClient.defaultHeaders = headers
  }

  /**
   * Make an HTTP request.
   * @param {RequestOptions} options - Request options.
   * @returns {Promise<HttpResponse>} - The response.
   */
  static async request<T = any>(options: RequestOptions): Promise<HttpResponse<T>> {
    const { url, method = 'GET', headers = {}, data, params } = options
    const fullUrl = HttpClient.constructUrl(url, params)
    const fetchOptions: RequestInit = {
      method,
      headers: { ...HttpClient.defaultHeaders, ...headers },
    }

    if (data) {
      fetchOptions.body = JSON.stringify(data)

      // Ensure headers are a Record<string, string> for safe access
      const headers = fetchOptions.headers || {}
      if (headers instanceof Headers) {
        // Convert `Headers` object to plain object if necessary
        fetchOptions.headers = Object.fromEntries(headers.entries())
      } else if (Array.isArray(headers)) {
        // Convert header tuples to plain object if necessary
        fetchOptions.headers = Object.fromEntries(headers)
      }

      if (!(fetchOptions.headers as Record<string, string>)['Content-Type']) {
        ;(fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
      }
    }

    try {
      const response = await fetch(fullUrl, fetchOptions)

      // Parse JSON response and catch errors
      const responseBody = (await response.json().catch(() => ({}))) as T

      if (!response.ok) {
        // eslint-disable-next-line no-throw-literal
        throw {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: responseBody,
          },
        }
      }

      return {
        status: response.status,
        statusText: response.statusText,
        data: responseBody,
      }
    } catch (error: any) {
      if (error.response) {
        throw error
      } else {
        // eslint-disable-next-line no-throw-literal
        throw { message: 'Network Error', cause: error }
      }
    }
  }

  /**
   * Make a GET request.
   * @param {string} url - The endpoint URL.
   * @param {object} options - Additional options (headers, params).
   * @returns {Promise<HttpResponse>} - The response.
   */
  static async get<T = any>(
    url: string,
    options: {
      params?: Record<string, any>
      headers?: Record<string, string>
    } = {},
  ): Promise<HttpResponse<T>> {
    return HttpClient.request<T>({ url, method: 'GET', ...options })
  }

  /**
   * Make a POST request.
   * @param {string} url - The endpoint URL.
   * @param {object} data - Request body.
   * @param {object} options - Additional options (headers).
   * @returns {Promise<HttpResponse>} - The response.
   */
  static async post<T = any>(
    url: string,
    data: Record<string, any>,
    options: { headers?: Record<string, string> } = {},
  ): Promise<HttpResponse<T>> {
    return HttpClient.request<T>({ url, method: 'POST', data, ...options })
  }

  /**
   * Make a PUT request.
   * @param {string} url - The endpoint URL.
   * @param {object} data - Request body.
   * @param {object} options - Additional options (headers).
   * @returns {Promise<HttpResponse>} - The response.
   */
  static async put<T = any>(
    url: string,
    data: Record<string, any>,
    options: { headers?: Record<string, string> } = {},
  ): Promise<HttpResponse<T>> {
    return HttpClient.request<T>({ url, method: 'PUT', data, ...options })
  }

  /**
   * Make a PATCH request.
   * @param {string} url - The endpoint URL.
   * @param {object} data - Request body.
   * @param {object} options - Additional options (headers).
   * @returns {Promise<HttpResponse>} - The response.
   */
  static async patch<T = any>(
    url: string,
    data: Record<string, any>,
    options: { headers?: Record<string, string> } = {},
  ): Promise<HttpResponse<T>> {
    return HttpClient.request<T>({ url, method: 'PATCH', data, ...options })
  }

  /**
   * Make a DELETE request.
   * @param {string} url - The endpoint URL.
   * @param {object} options - Additional options (headers).
   * @returns {Promise<HttpResponse>} - The response.
   */
  static async delete<T = any>(url: string, options: { headers?: Record<string, string> } = {}): Promise<HttpResponse<T>> {
    return HttpClient.request<T>({ url, method: 'DELETE', ...options })
  }

  /**
   * Construct a full URL with query parameters.
   * @param {string} url - The endpoint URL.
   * @param {Record<string, any>} [params] - Query parameters.
   * @returns {string} - The full URL.
   */
  static constructUrl(url: string, params?: Record<string, any>): string {
    const base = HttpClient.baseURL ? `${HttpClient.baseURL}${url}` : url
    if (!params) return base

    const queryString = new URLSearchParams(params).toString()
    return `${base}?${queryString}`
  }
}
