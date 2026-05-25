# Vaulto Backend API

Vaulto is a secure **Secrets Management and Vault Service** backend built with Node.js and MySQL. It provides encrypted storage for sensitive project data with granular access control, detailed audit logging, and a high-assurance authentication framework.

## ✅ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (raw SQL approach)
- **Authentication**: JWT (Access Tokens) + Opaque Refresh Tokens
- **Security**: bcrypt (passwords), SHA-256 (OTP), crypto (refresh token encryption/handling)
- **File Storage**: ImageKit.io
- **Email**: Nodemailer (SMTP/Gmail)
- **Validation**: express-validator

## 📁 Folder Structure

```text
src/
├── config/             # Environment configuration and fail-fast validation
├── db/                 # Database pool and migration scripts
├── middlewares/        # Auth guards and global error handling
├── modules/            # Domain-driven logic
│   ├── auth/           # Identity & session management
│   ├── projects/      # Vault/Project CRUD
│   ├── maintainers/    # RBAC (Role-Based Access Control)
│   └── audit/          # Security event logging
└── utils/              # Shared helpers (mailer, crypto, ImageKit, pagination)
```

## 👀 Preview Links

- **Watch Demo:** [View Here](https://drive.google.com/file/d/1_g2SyaP_WNV39AbhTBAQBpEbpffN_zUN/view?usp=sharing)

---

## 🔐 Core Systems & Logic

### 1) Authentication & Security Flow (high level)
- **Registration**: Creates a user with `is_email_verified: false`, generates a 6-digit OTP, hashes it using SHA-256, and sends it via email.
- **OTP Verification**: Uses a **SQL transaction** to atomically verify the user, delete the OTP record, and create the initial session.
- **Session Management**:
  - **Access tokens**: short-lived (~15m) via `httpOnly` cookies
  - **Refresh tokens**: long-lived, stored in DB
  - **Rotation**: each refresh revokes the old refresh token and issues a new one
- **Security features**: reduces information leakage (e.g., generic responses to prevent email enumeration).

### 2) Media Management (ImageKit)
Implemented in `utils/Imagekit.js`.

### 3) Error Handling Architecture
- **AppError** distinguishes operational vs programming errors.
- **catchAsync** forwards controller errors to the global error handler.
- Global handler returns a consistent JSON error response.

### 4) Database & Queries
- Raw SQL in `*.queries.js` files.
- Connection pool for efficiency.
- Session tracking includes IP and User-Agent (auditing/security).

## ⚙️ Environment Variables

Create a `.env` file in `vaulto-backend/`.

> Note: the backend **fails fast** on startup if any required variables are missing (see `src/config/index.js`).

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vaulto

# Authentication / Security
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=your_32_char_key

# Defaults
DEFAULT_AVATAR_URL=
DEFAULT_AVATAR_PUBLIC_ID=

# ImageKit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Email
EMAIL_USER=
EMAIL_PASS=
```

## 🧰 Development Commands

### Install
```bash
npm install
```

### Run migrations
```bash
node src/db/migrations/run.js
```

### Start server
```bash
npm start
```

### Dev mode
```bash
npm run dev
```

## 🛡️ Security Best Practices Implemented

1. **Passwords**: bcrypt (salt cost: 12)
2. **XSS protection**: tokens served via `httpOnly` cookies
3. **CSRF mitigation**: `sameSite: 'strict'` cookie policy
4. **SQL injection protection**: prepared statements via `mysql2`
5. **Fail-fast config**: validated on startup
6. **Generic errors**: avoid leaking sensitive data in error messages

---

## ❤️ Links / Contact

Made by **Rajendra Behera**

**Email:** [rajendrabehera8116@gmail.com](mailto:rajendrabehera8116@gmail.com)  
**LinkedIn:** [/behera-rajendra](https://www.linkedin.com/in/behera-rajendra/)  
**GitHub:** [/BRajendra10](https://github.com/BRajendra10)  

**Frontend:** [EdTech-Frontend](https://github.com/BRajendra10/vaulto-frontend)  
**Backend:** [EdTech-Backend](https://github.com/BRajendra10/vaulto-backend/)  

---