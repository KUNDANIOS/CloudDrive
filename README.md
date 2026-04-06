# 🌥️ CloudDrive - Personal Cloud Storage Solution

A full-stack cloud storage application with file management, sharing capabilities, and Google OAuth authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-77.2%25-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-22.6%25-yellow)
![CSS](https://img.shields.io/badge/CSS-0.2%25-purple)
  
## ✨ Features

- 📁 **File & Folder Management** - Upload, organize, and manage your files
- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📤 **File Upload/Download** - Seamless file operations
- 🔗 **File Sharing** - Generate shareable links for your files
- 🗑️ **Trash & Restore** - Safely delete and recover files
- ⭐ **Starred Files** - Mark important files for quick access
- 📊 **Storage Tracking** - Monitor your storage usage
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling

### Database & Storage
- **Supabase** - PostgreSQL database
- **Supabase Storage** - File storage solution

### Authentication
- **Google OAuth 2.0** - Social authentication

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console project (for OAuth)
- Domain name (for production deployment)

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/KUNDANIOS/CloudDrive.git
cd CloudDrive
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session
SESSION_SECRET=your_random_session_secret

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`frontend/.env.local`)
Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema (provided in `/backend/database/schema.sql`)
3. Enable Storage and create a bucket named `files`
4. Copy your project URL and anon key to `.env` files

### 5. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - `https://api.yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Secret to `.env` files

### 6. Run the application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Open your browser

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
CloudDrive/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   └── google.js          # Google OAuth strategy
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # Authentication routes
│   │   │   ├── files.js           # File management routes
│   │   │   ├── folders.js         # Folder management routes
│   │   │   ├── shares.js          # File sharing routes
│   │   │   └── trash.js           # Trash management routes
│   │   ├── index.js               # Express server entry
│   │   └── supabase.js            # Supabase client
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # Auth pages (login, register)
│   │   │   ├── (dashboard)/       # Dashboard pages
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── dashboard/         # Dashboard components
│   │   │   └── modals/            # Modal components
│   │   └── lib/
│   │       ├── api/               # API client functions
│   │       ├── store/             # Zustand stores
│   │       └── types/             # TypeScript types
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## 🔒 Security Features

- Environment variables for sensitive data
- Google OAuth 2.0 authentication
- Session management with secure cookies
- File access control per user
- CORS configuration
- Input validation and sanitization

## 🌐 Deployment

Ready to deploy? Check out the [Deployment Guide](https://github.com/KUNDANIOS/CloudDrive/wiki/Deployment-Guide) for detailed instructions on deploying to:

- **Frontend**: Vercel (recommended for Next.js)
- **Backend**: Render.com or Railway.app
- **Database**: Supabase (managed PostgreSQL)

### Quick Deployment Steps

1. Push code to GitHub ✅ (Done!)
2. Deploy backend to Render/Railway
3. Deploy frontend to Vercel
4. Configure custom domain
5. Update OAuth callback URLs
6. Set environment variables on hosting platforms

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**KUNDANIOS**
- GitHub: [@KUNDANIOS](https://github.com/KUNDANIOS)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Passport.js](http://www.passportjs.org/) - Authentication middleware

## 📧 Contact

For any queries or support, please open an issue on GitHub.

---

⭐ If you found this project helpful, please give it a star!
