# 🎬 BookMyShow Frontend - Quick Reference

## 📁 Location
```
D:\System Design\BookMyShow\frontend-deploy\
```

## 🔗 Backend URL (Already Configured)
```
https://bms-backend1-1.onrender.com
```

## ⚡ Quick Deploy

### Step 1: Push to GitHub
```powershell
cd "D:\System Design\BookMyShow\frontend-deploy"
.\setup_deploy.bat
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import: `your-username/bookmyshow-frontend`
3. Click "Deploy"
4. Done! ✅

---

## 🧪 Test Locally

```powershell
npm install
npm start
```

Open: http://localhost:3000

---

## 📊 Backend Connection

**Test Backend:**
```
https://bms-backend1-1.onrender.com/api/cities
```

**Configured in:** `src/api.js`

---

## 🎯 Test Credentials

- Admin: `admin` / `admin123`
- Demo: `demo` / `demo`

---

## 🔄 Update After Changes

```powershell
git add .
git commit -m "Update"
git push
```

Vercel/Netlify auto-redeploys.

---

**🚀 Start: `.\setup_deploy.bat`**
