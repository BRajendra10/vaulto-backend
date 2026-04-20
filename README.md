<<<<<<< HEAD
# vaulto-backend
=======
# Vaulto Backend API

Vaulto is a secure **Secrets Management and Vault Service** backend built with Node.js and MySQL. It is designed to provide encrypted storage for sensitive project data with granular access control, detailed audit logging, and a high-assurance authentication framework.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (Raw SQL approach)
- **Authentication**: JWT (Access Tokens) + Opaque Refresh Tokens
- **Security**: Bcrypt (Passwords), SHA-256 (OTP), Crypto (Refresh Tokens)
- **File Storage**: ImageKit.io
- **Email**: Nodemailer (SMTP/Gmail)
- **Validation**: Express-Validator

## 📂 Folder Structure

```text
src/
├── config/             # Environment configuration and fail-fast validation
├── db/                 # Database pool and migration scripts
├── middlewares/        # Auth guards and global error handling
├── modules/            # Domain-driven logic
│   ├── auth/           # Identity & Session Management
│   ├── projects/       # Vault/Project structure (CRUD)
│   ├── maintainers/    # RBAC (Role-Based Access Control)
│   └── audit/          # Security event logging
├── utils/              # Shared helpers (Mail, Crypto, ImageKit, Pagination)
└── constants/          # Application-wide constants
```

## 🚀 Core Systems & Logic

### 1. Authentication & Security Flow
The system implements a multi-step verification process:
- **Registration**: Creates a user with `is_email_verified: false`. Generates a 6-digit OTP, hashes it using SHA-256, and sends it via email.
- **OTP Verification**: Uses a **SQL Transaction** to atomically verify the user, delete the OTP record, and create the initial session.
- **Session Management**: 
    - **Access Tokens**: Short-lived (15m), stored in `httpOnly` cookies for browser security.
    - **Refresh Tokens**: Long-lived, stored in the database.
    - **Token Rotation**: Every refresh request revokes the old refresh token and issues a new one, mitigating the risk of stolen session tokens.
- **Security Features**: Protects against email enumeration by using generic error messages on sensitive endpoints.

### 2. Media Management (ImageKit)
Integrated via `utils/Imagekit.js`:
- Handles avatar uploads from local storage to ImageKit.
- Automatic cleanup of local temporary files using `fs.unlinkSync`.
- Secure deletion logic that prevents the app from crashing on media-server failures.

### 3. Error Handling Architecture
- **AppError**: A custom error class that distinguishes between "Operational Errors" (expected validation/auth failures) and "Programming Errors" (bugs).
- **catchAsync**: A wrapper that eliminates `try/catch` boilerplate in controllers by forwarding errors to the global handler.
- **Global Handler**: Standardizes all API errors into a consistent JSON format:
  ```json
  {
    "status": "error",
    "message": "User-friendly message",
    "errors": []
  }
  ```

### 4. Database & Queries
- Uses raw SQL queries defined in `.queries.js` files to maintain full control over database performance.
- Implements a connection pool for efficiency.
- Supports session tracking including IP Address and User-Agent for security auditing.

### 5. API Utilities
- **Pagination**: Standardized `getPagination` and `paginatedResponse` helpers to ensure all list endpoints follow the same metadata structure.
- **Mailer**: Centralized Nodemailer transporter with HTML/Text support.

## 📡 API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/register` | Register new user + send OTP |
| POST | `/verify-email` | Verify OTP + receive tokens |
| POST | `/resend-otp` | Securely resend verification code |
| POST | `/login` | Authenticate + receive tokens |
| POST | `/refresh` | Rotate session/refresh tokens |
| POST | `/logout` | Revoke current session |
| POST | `/logout-all` | Revoke all active sessions (Requires Auth) |

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vaulto

# Security
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
ENCRYPTION_KEY=your_32_char_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

# Email
EMAIL_USER=...
EMAIL_PASS=...

# Defaults
DEFAULT_AVATAR_URL=...
DEFAULT_AVATAR_PUBLIC_ID=...
```

## 🛠 Development Commands

### Installation
```bash
npm install
```

### Run Migrations
```bash
node src/db/migrations/run.js
```

### Start Server
```bash
npm start
```

## 🛡 Security Best Practices Implemented

1.  **Passwords**: Hashed with Bcrypt (Salt cost: 12).
2.  **XSS Protection**: Tokens served via `httpOnly` cookies.
3.  **CSRF Protection**: `sameSite: 'strict'` cookie policy.
4.  **SQL Injection**: All queries use prepared statements via `mysql2`.
5.  **Fail-Fast**: Config loader validates environment variables on startup.
6.  **Generic Errors**: Prevents data leaking via error messages.
```

<!--
[PROMPT_SUGGESTION]Can you help me implement a rate-limiting middleware using express-rate-limit to protect the login and resend-otp routes?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]How would I extend the session management to allow users to view a list of their active devices and revoke them individually?[/PROMPT_SUGGESTION]
-->
>>>>>>> 64f641898a42a5875f9cec11f0dd291c8279e3be
