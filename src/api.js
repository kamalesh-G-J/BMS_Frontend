// Use environment variable for API URL, fallback to deployed backend
const API_BASE = process.env.REACT_APP_API_URL || 'https://bms-backend1-1.onrender.com/api';

// Get session ID from localStorage
const getSessionId = () => localStorage.getItem('sessionId');

// Helper for API calls
const apiCall = async (endpoint, options = {}) => {
  const sessionId = getSessionId();
  const headers = {
    'Content-Type': 'application/json',
    ...(sessionId && { 'X-Session-Id': sessionId }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
};

// Auth APIs
export const authAPI = {
  login: async (username, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.success) {
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
    }
  },

  checkSession: async () => {
    const sessionId = getSessionId();
    if (!sessionId) return { valid: false };
    return apiCall('/auth/session');
  },

  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  },

  isLoggedIn: () => !!getSessionId(),
};

// Data APIs
export const dataAPI = {
  getCities: () => apiCall('/cities'),
  getMovies: () => apiCall('/movies'),
  getCinemas: (cityName) => apiCall(`/cinemas?cityName=${encodeURIComponent(cityName)}`),
  getShows: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/shows?${query}`);
  },
  getSeats: (showId) => apiCall(`/seats?showId=${showId}`),
  getBookings: () => apiCall('/bookings'),
};

// Booking APIs
export const bookingAPI = {
  lockSeats: (showId, seatIds) => {
    return apiCall('/book/lock', {
      method: 'POST',
      body: JSON.stringify({ showId, seatIds: JSON.stringify(seatIds) }),
    });
  },

  confirmBooking: (showId, seatIds, paymentMethod) => {
    return apiCall('/book/confirm', {
      method: 'POST',
      body: JSON.stringify({ 
        showId, 
        seatIds: JSON.stringify(seatIds),
        paymentMethod 
      }),
    });
  },

  releaseSeats: (showId, seatIds) => {
    return apiCall('/book/release', {
      method: 'POST',
      body: JSON.stringify({ showId, seatIds: JSON.stringify(seatIds) }),
    });
  },
};

// Admin APIs
export const adminAPI = {
  addMovie: (movieData) => {
    return apiCall('/admin/movie', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  },

  addCity: (cityData) => {
    return apiCall('/admin/city', {
      method: 'POST',
      body: JSON.stringify(cityData),
    });
  },

  addCinema: (cinemaData) => {
    return apiCall('/admin/cinema', {
      method: 'POST',
      body: JSON.stringify(cinemaData),
    });
  },

  addShow: (showData) => {
    return apiCall('/admin/show', {
      method: 'POST',
      body: JSON.stringify(showData),
    });
  },
};

export default { authAPI, dataAPI, bookingAPI, adminAPI };
