# BookMyShow Frontend

React frontend for BookMyShow movie ticket booking application.

## Backend Integration

**Backend URL:** `https://bms-backend1-1.onrender.com`

The frontend is configured to use this deployed backend by default.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (sign up with GitHub)
- Git installed

### Step 1: Push to GitHub

```powershell
cd "D:\System Design\BookMyShow\frontend-deploy"

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "BookMyShow Frontend - Ready for deployment"

# Set branch
git branch -M main

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bookmyshow-frontend.git

# Push
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your `bookmyshow-frontend` repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Environment Variables** (Optional):
   - Key: `REACT_APP_API_URL`
   - Value: `https://bms-backend1-1.onrender.com/api`
   - (Already set as default in code)

6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment

### Step 3: Access Your App

Your frontend will be live at:
```
https://your-project-name.vercel.app
```

---

## 🚀 Alternative: Deploy to Netlify

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select `bookmyshow-frontend`
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. Add Environment Variable (optional):
   - Key: `REACT_APP_API_URL`
   - Value: `https://bms-backend1-1.onrender.com/api`
6. Click **"Deploy site"**

---

## 🧪 Local Development

```powershell
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will run on `http://localhost:3000`

---

## 📁 Project Structure

```
frontend-deploy/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── App.js              # Main React component
│   ├── index.js            # React entry point
│   ├── index.css           # Complete styling
│   └── api.js              # API client (configured for deployed backend)
├── package.json            # Dependencies
├── .gitignore              # Git exclusions
└── README.md               # This file
```

---

## ✨ Features

- ✅ Movie browsing by city
- ✅ Theatre and show selection
- ✅ Interactive seat selection
- ✅ Real-time seat availability
- ✅ Booking management
- ✅ User authentication
- ✅ Admin panel
- ✅ Responsive design

---

## 🔗 Backend Integration

The frontend communicates with the backend at:
```
https://bms-backend1-1.onrender.com/api
```

### API Endpoints Used:
- Authentication: `/auth/login`, `/auth/register`, `/auth/logout`
- Data: `/cities`, `/movies`, `/cinemas`, `/shows`, `/seats`
- Booking: `/book/lock`, `/book/confirm`, `/book/release`
- Admin: `/admin/movie`, `/admin/city`, `/admin/cinema`, `/admin/show`

---

## 🎓 Test Credentials

- **Admin**: `admin` / `admin123`
- **Demo User**: `demo` / `demo`

---

## ⚙️ Environment Variables

You can override the backend URL by setting:

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

Default: `https://bms-backend1-1.onrender.com/api`

---

## 🐛 Troubleshooting

### CORS Errors
- Backend already has CORS enabled for all origins
- Check browser console for actual error
- Verify backend is running: `https://bms-backend1-1.onrender.com/api/cities`

### API Connection Issues
- Ensure backend is awake (first request takes 30-50s on free tier)
- Check Network tab in browser DevTools
- Verify API URL in `src/api.js`

### Build Fails
- Run `npm install` to ensure dependencies are installed
- Check for syntax errors: `npm run build` locally
- Verify Node.js version (14+ required)

---

## 📱 Mobile Responsive

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

---

## 🎨 Customization

### Update Backend URL

Edit `src/api.js`:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'https://your-backend.com/api';
```

### Modify Styling

Edit `src/index.css` for theme colors and styles.

---

## 📞 Support

- Backend URL: https://bms-backend1-1.onrender.com
- Test endpoint: https://bms-backend1-1.onrender.com/api/cities

---

**Ready to deploy? Run the setup script or follow Step 1 above!** 🚀
