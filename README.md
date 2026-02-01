# Doctor Link - Frontend

A modern, responsive healthcare appointment booking platform built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Patient Features
- 🔍 **Doctor Search** - Filter by specialization, fees, experience, and ratings
- 📅 **Appointment Booking** - Real-time availability and instant confirmation
- 💳 **Secure Payments** - Integrated Razorpay payment gateway
- ⭐ **Reviews & Ratings** - Read and write doctor reviews
- 📊 **Dashboard** - Track appointments and health records

### Doctor Features
- 🏥 **Practice Dashboard** - Manage appointments and patient requests
- ⏰ **Availability Management** - Set working hours and time slots
- 💰 **Earnings Tracking** - Monitor consultation fees and revenue
- 👥 **Patient Management** - View patient details and history

## 🛠️ Tech Stack

- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS (Vanilla)
- **Animations:** Framer Motion
- **Routing:** React Router DOM v7
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Notifications:** React Toastify
- **State Management:** Context API

## 📁 Project Structure

```
src/
├── assets/          # Images, icons, 3D models
├── components/
│   ├── common/      # Reusable components (Button, Input, Card)
│   ├── layout/      # Layout components (Navbar, Footer)
│   └── specialized/ # Domain-specific components
├── context/         # React Context (Auth, Theme)
├── hooks/           # Custom hooks
├── pages/
│   ├── public/      # Landing, About, Contact
│   ├── auth/        # Login, Register
│   ├── patient/     # Patient dashboard and features
│   └── doctor/      # Doctor dashboard and features
├── services/        # API service layer
└── utils/           # Helper functions
```

## 🎨 Design System

### Colors
- **Primary:** Medical Blue `#2563EB`
- **Accent:** Teal `#14B8A6`
- **Background (Light):** `#F8FAFC`
- **Background (Dark):** `#020617`

### Components
- **Glassmorphism Cards** - Modern, translucent design
- **Smooth Animations** - Framer Motion micro-interactions
- **Dark Mode** - Full theme support with toggle

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone and navigate:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API URL and Razorpay keys.

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## 📱 Responsive Design

- **Mobile:** 375px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build check
npm run build
```

## 🎯 Key Pages

- `/` - Landing page
- `/login` - User authentication
- `/register` - New user registration
- `/patient/dashboard` - Patient dashboard
- `/doctors` - Doctor search and filter
- `/doctor/dashboard` - Doctor dashboard

## 🔒 Authentication

- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Protected routes with automatic redirection

## 📦 Build Output

Production build is optimized and includes:
- Code splitting
- Asset optimization
- Tree shaking
- Minification

## 🤝 Contributing

This is a Final Year Project. For questions or suggestions, contact the development team.

## 📄 License

This project is part of an academic Final Year Project.

---

**Built with ❤️ for better healthcare access**
