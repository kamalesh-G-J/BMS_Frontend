import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { authAPI, dataAPI, bookingAPI, adminAPI } from './api';

// Context
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// App Provider
function AppProvider({ children }) {
  const [user, setUser] = useState(authAPI.getUser());
  const [city, setCity] = useState(localStorage.getItem('selectedCity') || 'Coimbatore');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const result = await authAPI.login(username, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const selectCity = (cityName) => {
    setCity(cityName);
    localStorage.setItem('selectedCity', cityName);
  };

  const isAdmin = user?.email === 'admin@bookmyshow.com' || user?.name === 'Admin User' || user?.username === 'admin';

  return (
    <AppContext.Provider value={{ user, city, loading, setLoading, login, logout, selectCity, isAdmin }}>
      {children}
    </AppContext.Provider>
  );
}

// Header Component
function Header() {
  const { user, city, logout, selectCity, isAdmin } = useApp();
  const [showCityModal, setShowCityModal] = useState(false);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    dataAPI.getCities().then(setCities).catch(console.error);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">Book<span className="logo-highlight">My</span>Show</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Movies</Link>
          {user && <Link to="/bookings">My Bookings</Link>}
          {isAdmin && <Link to="/admin" className="admin-link">⚙️ Admin</Link>}
        </nav>
        <div className="header-right">
          <button className="city-selector" onClick={() => setShowCityModal(true)}>
            <span className="city-icon">📍</span>
            <span>{city}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <div className="user-info">
                <span className="user-name">{user.name || 'User'}</span>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login"><button className="btn btn-outline">Login</button></Link>
              <Link to="/register"><button className="btn btn-primary">Sign Up</button></Link>
            </div>
          )}
        </div>
      </header>

      {showCityModal && (
        <div className="modal-overlay" onClick={() => setShowCityModal(false)}>
          <div className="modal city-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCityModal(false)}>×</button>
            <h2 className="modal-title">🏙️ Select Your City</h2>
            <p className="modal-subtitle">Experience movies in your city</p>
            <div className="city-grid">
              {cities.map(c => (
                <div
                  key={c.id}
                  className={`city-option ${city === c.name ? 'selected' : ''}`}
                  onClick={() => { selectCity(c.name); setShowCityModal(false); }}
                >
                  <span className="city-emoji">🏛️</span>
                  <span className="city-name">{c.name}</span>
                  {city === c.name && <span className="city-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Login Page
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <span className="auth-icon">🎬</span>
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Sign in to book your favorite movies</p>
        </div>
        
        {error && <div className="error-message"><span>⚠️</span> {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><span>👤</span> Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username or email"
              required
            />
          </div>
          <div className="form-group">
            <label><span>🔒</span> Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner-small"></span> Signing in...</> : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-divider"><span>or</span></div>
        
        <p className="auth-link">
          New to BookMyShow? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

// Register Page
function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '', name: '', email: '', phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.register(formData);
      if (result.success) {
        setSuccess('🎉 Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box auth-box-large">
        <div className="auth-header">
          <span className="auth-icon">🎟️</span>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us for the best movie experience</p>
        </div>
        
        {error && <div className="error-message"><span>⚠️</span> {error}</div>}
        {success && <div className="success-message"><span>✓</span> {success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@email.com" required />
            </div>
            <div className="form-group">
              <label>Phone (Optional)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner-small"></span> Creating Account...</> : 'Create Account'}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

// Home Page
function HomePage() {
  const { city } = useApp();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    dataAPI.getMovies()
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-large"></div>
          <p>Loading amazing movies...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <h1>Book Movie Tickets in <span className="highlight">{city}</span></h1>
          <p>Get the best seats for the latest blockbusters</p>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search movies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Now Showing in {city}</h2>
          <span className="movie-count">{filteredMovies.length} Movies</span>
        </div>
        
        {filteredMovies.length === 0 ? (
          <div className="empty-state">
            <p>No movies found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="movie-grid">
            {filteredMovies.map((movie, index) => (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-link">
                <div className="movie-card">
                  <div className="movie-poster" data-index={index}>
                    <span className="movie-initial">{movie.title.charAt(0)}</span>
                    <div className="movie-overlay">
                      <button className="btn btn-book">Book Now</button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <div className="movie-meta">
                      <span className="movie-duration">{movie.duration} mins</span>
                      <span className="movie-lang">{movie.language}</span>
                    </div>
                    <span className="movie-genre">{movie.genre}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Movie Detail Page - FIXED city filtering
function MoviePage() {
  const { id } = useParams();
  const { city, user } = useApp();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesData, showsData, cinemasData] = await Promise.all([
          dataAPI.getMovies(),
          dataAPI.getShows({ movieId: id }),
          dataAPI.getCinemas(city)
        ]);
        
        setMovie(moviesData.find(m => m.id === id));
        // FIXED: Filter cinemas by city properly
        const cityCinemas = cinemasData.filter(c => 
          c.city.toLowerCase() === city.toLowerCase()
        );
        setCinemas(cityCinemas);
        setShows(showsData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, city]);

  const handleShowSelect = (showId) => {
    if (!user) {
      navigate('/login', { state: { from: `/seats/${showId}` } });
    } else {
      navigate(`/seats/${showId}`);
    }
  };

  // FIXED: Better matching of shows to cinemas by city
  const getShowsForCinema = (cinema) => {
    return shows.filter(s => {
      const screenCinemaId = s.screenId.split('_screen')[0];
      return screenCinemaId === cinema.id;
    });
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner-large"></div><p>Loading...</p></div>;
  }

  if (!movie) {
    return <div className="container"><div className="empty-state"><p>Movie not found</p></div></div>;
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-banner">
        <div className="movie-banner-content">
          <div className="movie-poster-large">{movie.title.charAt(0)}</div>
          <div className="movie-details">
            <h1>{movie.title}</h1>
            <div className="movie-badges">
              <span className="badge">UA</span>
              <span className="badge">{movie.language}</span>
              <span className="badge">{movie.genre}</span>
            </div>
            <p className="movie-duration-large">{movie.duration} mins</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Theatres in {city}</h2>
          <span className="theatre-count">{cinemas.length} Theatres</span>
        </div>
        
        {cinemas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"></span>
            <p>No theatres available in {city} for this movie</p>
          </div>
        ) : (
          <div className="theatre-list">
            {cinemas.map(cinema => {
              const cinemaShows = getShowsForCinema(cinema);
              return (
                <div className="theatre-card" key={cinema.id}>
                  <div className="theatre-info">
                    <h3 className="theatre-name">{cinema.name}</h3>
                    <p className="theatre-location">{cinema.city} • {cinema.screens} Screens</p>
                  </div>
                  <div className="show-times">
                    {cinemaShows.length > 0 ? cinemaShows.map(show => (
                      <button
                        key={show.id}
                        className="show-time-btn"
                        onClick={() => handleShowSelect(show.id)}
                      >
                        {new Date(show.startTime).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </button>
                    )) : (
                      <span className="no-shows">No shows available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Payment Page
function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showId, selectedSeats, showInfo, totalAmount } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!showId || !selectedSeats) {
    navigate('/');
    return null;
  }

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // Lock seats
      const lockResult = await bookingAPI.lockSeats(showId, selectedSeats.map(s => s.id));
      
      if (!lockResult.success) {
        setError(lockResult.error || 'Seats no longer available');
        setProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm booking
      const bookResult = await bookingAPI.confirmBooking(showId, selectedSeats.map(s => s.id), paymentMethod);

      if (bookResult.success) {
        navigate('/receipt', {
          state: {
            booking: bookResult,
            movie: showInfo?.movieTitle,
            seats: selectedSeats,
            showTime: showInfo?.startTime,
            paymentMethod,
            screenId: showInfo?.screenId
          }
        });
      } else {
        setError(bookResult.error || 'Payment failed');
        await bookingAPI.releaseSeats(showId, selectedSeats.map(s => s.id));
      }
    } catch (err) {
      setError(err.message);
    }

    setProcessing(false);
  };

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-container">
          <div className="payment-summary">
            <h2>📋 Booking Summary</h2>
            <div className="summary-card">
              <div className="summary-item">
                <span>Movie</span>
                <strong>{showInfo?.movieTitle}</strong>
              </div>
              <div className="summary-item">
                <span>Show Time</span>
                <strong>{showInfo && new Date(showInfo.startTime).toLocaleString()}</strong>
              </div>
              <div className="summary-item">
                <span>Seats</span>
                <strong>{selectedSeats.map(s => `R${s.row}C${s.col}`).join(', ')}</strong>
              </div>
              <div className="summary-item">
                <span>Tickets</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item total">
                <span>Total Amount</span>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h2>💳 Select Payment Method</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="payment-options">
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map(method => (
                <div 
                  key={method}
                  className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <span className="payment-icon">
                    {method === 'UPI' && '📱'}
                    {method === 'Credit Card' && '💳'}
                    {method === 'Debit Card' && '💳'}
                    {method === 'Net Banking' && '🏦'}
                    {method === 'Wallet' && '👛'}
                  </span>
                  <span>{method}</span>
                  {paymentMethod === method && <span className="check">✓</span>}
                </div>
              ))}
            </div>

            {paymentMethod === 'UPI' && (
              <div className="upi-input">
                <label>UPI ID</label>
                <input type="text" placeholder="yourname@upi" />
              </div>
            )}

            <button 
              className="btn btn-primary btn-full btn-pay"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <><span className="spinner-small"></span> Processing Payment...</>
              ) : (
                <>💳 Pay ₹{totalAmount.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// QR Code Generator (Simple implementation)
function QRCode({ data, size = 150 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = size / 25;
    
    // Generate simple QR-like pattern based on data
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'black';
    
    // Corner patterns
    const drawCorner = (x, y) => {
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = 'white';
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = 'black';
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    };
    
    drawCorner(0, 0);
    ctx.fillStyle = 'black';
    drawCorner(size - cellSize * 7, 0);
    ctx.fillStyle = 'black';
    drawCorner(0, size - cellSize * 7);
    
    // Data pattern (pseudo-random based on data string)
    ctx.fillStyle = 'black';
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 8; i < 17; i++) {
      for (let j = 8; j < 17; j++) {
        if ((hash * i * j) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Timing patterns
    for (let i = 8; i < 17; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [data, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="qr-code" />;
}

// Receipt Page with QR Code
function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const { booking, movie, seats, showTime, paymentMethod, screenId } = location.state || {};

  if (!booking) {
    navigate('/');
    return null;
  }

  const qrData = `BOOKMYSHOW|${booking.bookingId}|${movie}|${seats?.length}|${booking.amount}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const text = `
=================================
       🎬 BOOKMYSHOW TICKET
=================================

Booking ID: ${booking.bookingId}
Transaction: ${booking.transactionId}

Movie: ${movie}
Date & Time: ${new Date(showTime).toLocaleString()}
Screen: ${screenId || 'Screen 1'}

Seats: ${seats?.map(s => `R${s.row}C${s.col}`).join(', ')}
Tickets: ${seats?.length}

Payment: ${paymentMethod}
Amount Paid: ₹${booking.amount?.toFixed(2)}

=================================
      THANK YOU FOR BOOKING!
=================================
    `;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${booking.bookingId}.txt`;
    a.click();
  };

  return (
    <div className="receipt-page">
      <div className="container">
        <div className="receipt-container" ref={receiptRef}>
          <div className="receipt-header">
            <span className="receipt-icon">🎫</span>
            <h1>Booking Confirmed!</h1>
            <p>Your tickets have been booked successfully</p>
          </div>

          <div className="receipt-ticket">
            <div className="ticket-left">
              <div className="ticket-movie">
                <h2>{movie}</h2>
                <p className="ticket-badge">UA • Tamil</p>
              </div>
              
              <div className="ticket-details">
                <div className="ticket-row">
                  <div className="ticket-item">
                    <label>📅 Date & Time</label>
                    <span>{new Date(showTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>{new Date(showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <div className="ticket-item">
                    <label>🎭 Screen</label>
                    <span>{screenId?.split('_').pop() || 'Screen 1'}</span>
                  </div>
                </div>
                
                <div className="ticket-row">
                  <div className="ticket-item">
                    <label>💺 Seats</label>
                    <span className="seats-list">{seats?.map(s => `R${s.row}C${s.col}`).join(', ')}</span>
                  </div>
                  <div className="ticket-item">
                    <label>🎟️ Tickets</label>
                    <span>{seats?.length}</span>
                  </div>
                </div>
              </div>

              <div className="ticket-payment">
                <div className="payment-row">
                  <span>Booking ID</span>
                  <span className="booking-id">{booking.bookingId?.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="payment-row">
                  <span>Transaction ID</span>
                  <span>{booking.transactionId}</span>
                </div>
                <div className="payment-row">
                  <span>Payment Method</span>
                  <span>{paymentMethod}</span>
                </div>
                <div className="payment-row total">
                  <span>Total Paid</span>
                  <span className="amount">₹{booking.amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="ticket-right">
              <div className="qr-section">
                <QRCode data={qrData} size={150} />
                <p className="qr-label">Scan at theatre entrance</p>
              </div>
              <div className="ticket-barcode">
                {booking.bookingId?.substring(0, 12).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="receipt-footer">
            <p>📱 Show this ticket at the theatre entrance</p>
            <p>🍿 Enjoy your movie!</p>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print Ticket
          </button>
          <button className="btn btn-outline" onClick={handleDownload}>
            📥 Download
          </button>
          <Link to="/"><button className="btn btn-secondary">🎬 Book More</button></Link>
        </div>
      </div>
    </div>
  );
}

// Seat Selection Page
function SeatSelectionPage() {
  const { showId } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/seats/${showId}` } });
      return;
    }
    
    const fetchData = async () => {
      try {
        const [seatsResult, showsResult] = await Promise.all([
          dataAPI.getSeats(showId),
          dataAPI.getShows({})
        ]);
        setSeatData(seatsResult);
        setShowInfo(showsResult.find(s => s.id === showId));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    
    fetchData();
    
    const interval = setInterval(() => {
      dataAPI.getSeats(showId).then(setSeatData).catch(console.error);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [showId, user, navigate]);

  const toggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    
    setSelectedSeats(prev => {
      if (prev.find(s => s.id === seat.id)) {
        return prev.filter(s => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const getTotalAmount = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) return;
    
    navigate('/payment', {
      state: {
        showId,
        selectedSeats,
        showInfo,
        totalAmount: getTotalAmount()
      }
    });
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner-large"></div><p>Loading seats...</p></div>;
  }

  if (!seatData) {
    return <div className="container"><div className="empty-state"><span>🎭</span><p>Show not found</p></div></div>;
  }

  const seatsByRow = {};
  seatData.seats.forEach(seat => {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  });

  const rows = Object.keys(seatsByRow).sort((a, b) => a - b);

  return (
    <div className="seat-selection-page">
      <div className="seat-header">
        <h2>{showInfo?.movieTitle || 'Select Seats'}</h2>
        <p>{showInfo && new Date(showInfo.startTime).toLocaleString()}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="seat-layout">
        <div className="screen-container">
          <div className="screen"></div>
          <div className="screen-label">SCREEN</div>
        </div>

        <div className="seat-legend">
          <div className="legend-item"><div className="legend-box available"></div><span>Available</span></div>
          <div className="legend-item"><div className="legend-box selected"></div><span>Selected</span></div>
          <div className="legend-item"><div className="legend-box locked"></div><span>Locked</span></div>
          <div className="legend-item"><div className="legend-box booked"></div><span>Booked</span></div>
        </div>

        <div className="seats-container">
          {rows.map(row => (
            <div className="seat-row" key={row}>
              <div className="row-label">{row <= 2 ? '🛋️' : row <= 5 ? '⭐' : '🪑'} {row}</div>
              <div className="row-seats">
                {seatsByRow[row]
                  .sort((a, b) => a.col - b.col)
                  .map(seat => {
                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                    return (
                      <button
                        key={seat.id}
                        className={`seat ${seat.type.toLowerCase()} ${seat.status.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seat)}
                        disabled={seat.status !== 'AVAILABLE'}
                        title={`${seat.type} - ₹${seat.price}`}
                      >
                        {seat.col}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="price-legend">
          <span>🛋️ RECLINER ₹120</span>
          <span>⭐ PREMIUM ₹80</span>
          <span>🪑 REGULAR ₹60</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="booking-bar">
          <div className="booking-info">
            <span className="seat-count">{selectedSeats.length} Seat(s)</span>
            <span className="seat-names">{selectedSeats.map(s => `R${s.row}C${s.col}`).join(', ')}</span>
          </div>
          <div className="booking-action">
            <span className="total-amount">₹{getTotalAmount().toFixed(2)}</span>
            <button className="btn btn-primary" onClick={handleProceedToPayment}>
              Proceed to Pay →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Bookings Page
function BookingsPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    dataAPI.getBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return <div className="loading-container"><div className="spinner-large"></div><p>Loading bookings...</p></div>;
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h2 className="page-title">🎫 My Bookings</h2>
        
        {bookings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎬</span>
            <p>No bookings yet</p>
            <Link to="/"><button className="btn btn-primary">Browse Movies</button></Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div className="booking-card" key={booking.id}>
                <div className="booking-poster">🎬</div>
                <div className="booking-details">
                  <h3>{booking.movieTitle}</h3>
                  <p>📅 {new Date(booking.showTime).toLocaleString()}</p>
                  <p>🎭 {booking.cinema}</p>
                  <p>📍 {booking.city}</p>
                  <p>💺 {booking.seats} seat(s)</p>
                </div>
                <div className="booking-status">
                  <span className={`status-badge ${booking.status?.toLowerCase()}`}>{booking.status}</span>
                  <span className="booking-amount">₹{booking.amount?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Page
function AdminPage() {
  const { isAdmin, user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [moviesData, citiesData, cinemasData] = await Promise.all([
          dataAPI.getMovies(),
          dataAPI.getCities(),
          dataAPI.getCinemas('')
        ]);
        setMovies(moviesData);
        setCities(citiesData);
        setCinemas(cinemasData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [isAdmin, user, navigate]);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const result = await adminAPI.addMovie(formData);
      if (result.success) {
        setMessage('✅ Movie added successfully!');
        setMovies([...movies, { id: result.id, ...formData }]);
        setShowModal(null);
        setFormData({});
      } else {
        setMessage('❌ ' + (result.error || 'Failed to add movie'));
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const result = await adminAPI.addCity(formData);
      if (result.success) {
        setMessage('✅ City added successfully!');
        setCities([...cities, { id: result.id, ...formData }]);
        setShowModal(null);
        setFormData({});
      } else {
        setMessage('❌ ' + (result.error || 'Failed to add city'));
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
  };

  const handleAddCinema = async (e) => {
    e.preventDefault();
    try {
      const result = await adminAPI.addCinema(formData);
      if (result.success) {
        setMessage('✅ Theatre added successfully!');
        setCinemas([...cinemas, { id: result.id, ...formData }]);
        setShowModal(null);
        setFormData({});
      } else {
        setMessage('❌ ' + (result.error || 'Failed to add theatre'));
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner-large"></div></div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage movies, cities, and theatres</p>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
            <button onClick={() => setMessage('')}>×</button>
          </div>
        )}

        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >🎬 Movies ({movies.length})</button>
          <button 
            className={`tab ${activeTab === 'cities' ? 'active' : ''}`}
            onClick={() => setActiveTab('cities')}
          >🏙️ Cities ({cities.length})</button>
          <button 
            className={`tab ${activeTab === 'cinemas' ? 'active' : ''}`}
            onClick={() => setActiveTab('cinemas')}
          >🎭 Theatres ({cinemas.length})</button>
        </div>

        <div className="admin-content">
          {activeTab === 'movies' && (
            <>
              <div className="admin-toolbar">
                <h2>🎬 Movies</h2>
                <button className="btn btn-primary" onClick={() => setShowModal('movie')}>+ Add Movie</button>
              </div>
              <div className="admin-grid">
                {movies.map(movie => (
                  <div className="admin-card" key={movie.id}>
                    <h3>{movie.title}</h3>
                    <p>⏱️ {movie.duration} mins</p>
                    <p>🎭 {movie.language} • {movie.genre}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'cities' && (
            <>
              <div className="admin-toolbar">
                <h2>🏙️ Cities</h2>
                <button className="btn btn-primary" onClick={() => setShowModal('city')}>+ Add City</button>
              </div>
              <div className="admin-grid">
                {cities.map(city => (
                  <div className="admin-card" key={city.id}>
                    <h3>📍 {city.name}</h3>
                    <p>{city.state}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'cinemas' && (
            <>
              <div className="admin-toolbar">
                <h2>🎭 Theatres</h2>
                <button className="btn btn-primary" onClick={() => setShowModal('cinema')}>+ Add Theatre</button>
              </div>
              <div className="admin-grid">
                {cinemas.map(cinema => (
                  <div className="admin-card" key={cinema.id}>
                    <h3>🎭 {cinema.name}</h3>
                    <p>📍 {cinema.city}</p>
                    <p>🖥️ {cinema.screens} Screens</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Movie Modal */}
        {showModal === 'movie' && (
          <div className="modal-overlay" onClick={() => setShowModal(null)}>
            <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(null)}>×</button>
              <h2>🎬 Add New Movie</h2>
              <form onSubmit={handleAddMovie}>
                <div className="form-group">
                  <label>Movie Title</label>
                  <input type="text" required value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (mins)</label>
                    <input type="number" required value={formData.duration || ''} 
                      onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select value={formData.language || 'Tamil'} 
                      onChange={e => setFormData({...formData, language: e.target.value})}>
                      <option>Tamil</option>
                      <option>Telugu</option>
                      <option>Hindi</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <select value={formData.genre || 'Action'} 
                    onChange={e => setFormData({...formData, genre: e.target.value})}>
                    <option>Action</option>
                    <option>Drama</option>
                    <option>Comedy</option>
                    <option>Thriller</option>
                    <option>Romance</option>
                    <option>Historical</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-full">Add Movie</button>
              </form>
            </div>
          </div>
        )}

        {/* Add City Modal */}
        {showModal === 'city' && (
          <div className="modal-overlay" onClick={() => setShowModal(null)}>
            <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(null)}>×</button>
              <h2>🏙️ Add New City</h2>
              <form onSubmit={handleAddCity}>
                <div className="form-group">
                  <label>City Name</label>
                  <input type="text" required value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" required value={formData.state || 'Tamil Nadu'} 
                    onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Add City</button>
              </form>
            </div>
          </div>
        )}

        {/* Add Cinema Modal */}
        {showModal === 'cinema' && (
          <div className="modal-overlay" onClick={() => setShowModal(null)}>
            <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(null)}>×</button>
              <h2>🎭 Add New Theatre</h2>
              <form onSubmit={handleAddCinema}>
                <div className="form-group">
                  <label>Theatre Name</label>
                  <input type="text" required value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <select required value={formData.city || ''} 
                    onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Screens</label>
                  <input type="number" required min="1" max="10" value={formData.screens || ''} 
                    onChange={e => setFormData({...formData, screens: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Add Theatre</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/seats/:showId" element={<SeatSelectionPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/confirmation" element={<ReceiptPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
