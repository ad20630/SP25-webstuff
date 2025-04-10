// API service to handle all server requests

// Use the port discovered by ServerStatus component, or fall back to the proxy
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/api';
  }
  return '/api'; // For production
};

// When a direct connection fails, try the proxy route
const getApiProxyUrl = (): string => {
  return '/api'; // Use relative URL with proxy
};

// Helper function to handle API responses with timeout
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Response:', response.status, errorText);
    throw new Error(`Server error (${response.status}): ${errorText}`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw new Error('Invalid server response format');
  }
};

// Fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Fetch with fallback to proxy
const fetchWithFallback = async (endpoint: string, options: RequestInit) => {
  // Try direct connection first if a port is specified
  const directUrl = `${getApiBaseUrl()}${endpoint}`;
  const proxyUrl = `${getApiProxyUrl()}${endpoint}`;
  
  // If we're already using a proxy URL, don't try direct connection
  if (directUrl === proxyUrl) {
    console.log(`Using proxy URL for ${endpoint}: ${proxyUrl}`);
    return await fetchWithTimeout(proxyUrl, options, 8000);
  }
  
  try {
    console.log(`Trying direct connection for ${endpoint}: ${directUrl}`);
    return await fetchWithTimeout(directUrl, options, 8000);
  } catch (error) {
    // If direct connection fails, try proxy
    console.warn(`Direct connection failed for ${endpoint}, falling back to proxy`, error);
    
    // Clear any stored port that's not working
    if (localStorage.getItem('API_SERVER_PORT')) {
      console.warn('Clearing stored port due to connection failure');
      localStorage.removeItem('API_SERVER_PORT');
    }
    
    console.log(`Using proxy fallback for ${endpoint}: ${proxyUrl}`);
    return await fetchWithTimeout(proxyUrl, options, 8000);
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      console.log('Login request with email:', email);
      const response = await fetchWithTimeout(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Login request failed:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Server connection timed out. Please check if the server is running.');
        }
        throw new Error(`Login failed: ${error.message}`);
      }
      throw error;
    }
  },
  
  register: async (email: string, password: string, name: string) => {
    try {
      console.log('Registration request with email:', email, 'and name:', name);
      
      const payload = {
        email: email,
        password: password,
        name: name
      };
      
      console.log('Using registration payload:', payload);
      
      const response = await fetchWithTimeout(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Registration request failed:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Server connection timed out. Please check if the server is running.');
        }
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw error;
    }
  },
  
  // Add a simple API health check method
  checkHealth: async () => {
    try {
      const response = await fetchWithTimeout(`${getApiBaseUrl()}/health`, { 
        method: 'HEAD' 
      }, 3000);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

export default {
  auth: authApi
}; 
