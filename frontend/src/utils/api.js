/**
 * API client to query the backend endpoints.
 * Automatically injects the JWT Bearer token from localStorage if present.
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('/api')
    ? endpoint
    : (endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`);

  // Build headers
  const headers = { ...options.headers };

  // If body is JSON, set content type
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Retrieve JWT from localStorage and inject into request
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  if (userInfo && userInfo.token) {
    headers['Authorization'] = `Bearer ${userInfo.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse JSON data
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Network request failed');
  }

  return data;
};

export default apiRequest;
