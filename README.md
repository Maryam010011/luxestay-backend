# LuxeStay Backend API

Standalone REST API backend for the **LuxeStay** luxury hotel booking platform. Built with Node.js, Express, MongoDB (Mongoose), and deployable to Vercel Serverless Functions.

---

## 🚀 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5
- **Database:** MongoDB via Mongoose
- **Authentication:** JWT (`jsonwebtoken`) & password hashing with `bcryptjs`
- **Email Notifications:** Resend API (`resend`)
- **Serverless Ready:** Configured for Vercel Serverless Functions (`api/index.js`)

---

## 📁 Project Structure

```
luxestay-backend/
├── api/
│   └── index.js              # Vercel Serverless function entrypoint
├── server/
│   ├── config/
│   │   └── db.js             # MongoDB connection with serverless pooling & caching
│   ├── controllers/
│   │   ├── authController.js    # Register, login, getMe
│   │   ├── bookingController.js # CRUD bookings + confirmation emails
│   │   └── hotelController.js   # CRUD hotels, filters, search
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   └── requireAdmin.js   # Admin role authorization guard
│   ├── models/
│   │   ├── Booking.js        # Booking Mongoose schema
│   │   ├── Hotel.js          # Hotel Mongoose schema
│   │   └── User.js           # User Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth routes
│   │   ├── bookingRoutes.js  # /api/bookings routes
│   │   └── hotelRoutes.js    # /api/hotels routes
│   ├── services/
│   │   └── emailService.js   # Resend transactional email helper
│   ├── app.js                # Express application configuration & routes
│   ├── createAdmin.js        # Interactive CLI script to create admin user
│   ├── seed.js               # Database seeder for sample hotels
│   └── server.js             # Local Node.js server entrypoint
├── .env.example              # Example environment configuration
├── .gitignore                # Git ignore rules
├── package.json              # Backend dependencies and scripts
├── vercel.json               # Vercel serverless deployment config
└── README.md                 # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of `luxestay-backend/` by copying `.env.example`:

```bash
cp .env.example .env
```

Set the following variables:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | No (Default: 5000) | Local server port | `5000` |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/luxestay?retryWrites=true&w=majority` |
| `JWT_SECRET` | **Yes** | Secret key used to sign & verify JWT tokens | `super-secret-random-jwt-key` |
| `RESEND_API_KEY` | Optional | Resend API Key for sending booking emails | `re_123456789...` |
| `VITE_LITEAPI_KEY` | Optional | LiteAPI key if using the seed script | `sand_...` |

---

## 🛠️ Getting Started Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create and fill out your `.env` file as described above.

### 3. (Optional) Seed Database & Create Admin

- **Seed Hotels:**
  ```bash
  npm run seed
  ```
- **Create Admin User:**
  ```bash
  npm run create-admin
  ```

### 4. Run Development Server

```bash
npm run dev
# or
npm run server:dev
```

The API will be live at `http://localhost:5000`.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` / `npm run server:dev` | `node --watch server/server.js` | Runs local server with file auto-reloading |
| `npm run start` / `npm run server:start` | `node server/server.js` | Starts server in production mode |
| `npm run seed` | `node server/seed.js` | Seeds MongoDB with luxury hotel data |
| `npm run create-admin` | `node server/createAdmin.js` | Interactive prompt to create an admin account |

---

## 🌐 API Endpoints Overview

### Health
- `GET /api/health` - Healthcheck & MongoDB connection status

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Login customer/admin and receive JWT
- `GET /api/auth/me` - Get current authenticated user profile (*Auth required*)

### Hotels (`/api/hotels`)
- `GET /api/hotels` - List all hotels (supports query filters)
- `GET /api/hotels/:id` - Get hotel details by ID
- `POST /api/hotels` - Add a new hotel (*Admin only*)
- `PUT /api/hotels/:id` - Update hotel details (*Admin only*)
- `DELETE /api/hotels/:id` - Delete hotel (*Admin only*)

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Create a booking & dispatch confirmation email (*Auth required*)
- `GET /api/bookings` - Get current user bookings (*Auth required*) / All bookings (*Admin only*)
- `GET /api/bookings/:id` - Get single booking details (*Auth required*)
- `PATCH /api/bookings/:id/status` - Update booking status (*Admin only*)
- `DELETE /api/bookings/:id` - Cancel booking (*Auth required*)

---

## ☁️ Deployment on Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project into Vercel.
3. In Vercel Project Settings:
   - **Framework Preset:** Other
   - **Build Command:** *(Leave empty)*
   - **Output Directory:** *(Leave empty)*
   - **Environment Variables:** Add `MONGODB_URI`, `JWT_SECRET`, and `RESEND_API_KEY`.
4. Deploy! All API routes will be handled by the serverless function in `api/index.js`.
