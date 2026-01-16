# User Service - Registration & Login Implementation Guide

## Overview
Complete registration and login system with email verification using NestJS, PostgreSQL, and Mailtrap for email delivery.

## Features Implemented

### ✅ User Registration
- Full name input validation
- Email address (unique)
- Mobile number (unique)
- Password (hashed with bcrypt)
- Email verification token generation
- Automatic verification email sending

### ✅ Email Verification
- Verification token sent via Mailtrap
- Email link for verification
- Secure token-based confirmation
- User can only login after email verification

### ✅ User Login
- Email and password authentication
- JWT token generation
- Email verification required before login
- Comprehensive error handling

### ✅ Logging & Monitoring
- Console logs for all operations
- NestJS Logger enabled at application level
- Database query logging
- Error tracking with detailed messages

## Database Schema

### Users Table Fields
```sql
- id (UUID, Primary Key)
- fullName (String, Required)
- email (String, Unique, Required)
- mobileNumber (String, Unique, Required)
- password (String, Hashed, Required)
- role (String, Default: 'user')
- isEmailVerified (Boolean, Default: false)
- emailVerificationToken (String, Nullable)
- createdAt (Timestamp, Auto-generated)
```

## Email Configuration
**Provider:** Mailtrap (Sandbox)
- **Host:** sandbox.smtp.mailtrap.io
- **Port:** 2525
- **Username:** 6ac3c94ffeb98a
- **Password:** 4ef9095f7ae5da

## API Endpoints

### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "+1234567890",
  "password": "SecurePass123"
}

Response:
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "uuid-string",
  "email": "john@example.com"
}
```

### 2. Verify Email (Via Link)
```
GET /auth/verify-email?token=<verification_token>

Response:
{
  "message": "Email verified successfully. You can now login.",
  "email": "john@example.com"
}
```

### 3. Verify Email (Via POST)
```
POST /auth/verify-email
Content-Type: application/json

{
  "token": "<verification_token>"
}

Response:
{
  "message": "Email verified successfully. You can now login.",
  "email": "john@example.com"
}
```

### 4. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 5. Get Current User Profile
```
GET /users/me
Authorization: Bearer <access_token>

Response:
{
  "id": "uuid-string",
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "+1234567890",
  "role": "user",
  "isEmailVerified": true,
  "createdAt": "2026-01-16T12:35:56.000Z"
}
```

## Prerequisites

### Required Services
1. **PostgreSQL** (Port: 5432)
   ```
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=Pass@1234
   DB_NAME=project
   ```

2. **Redis** (Port: 6379) - For additional features
   ```
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Ensure `.env` file exists in root with:
```
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD="Pass@1234"
DB_NAME=project
JWT_SECRET=IBIL_GLOBAL_SECRET
PORT=2525
NODE_ENV=development
```

### 3. Start Database Services
```bash
# PostgreSQL
psql -U postgres

# Redis
redis-cli
```

### 4. Run Application
```bash
# Development (with watch mode)
npm run start:dev

# Production build
npm run build

# Production start
npm run start:prod
```

## Console Logs & Monitoring

### Registration Flow Logs
```
📝 Registration attempt for email: john@example.com
🎫 Generated verification token for: john@example.com
👤 Creating new user: john@example.com
🔐 Password hashed successfully for: john@example.com
✅ User created and saved successfully: <uuid>
📧 Preparing verification email for: john@example.com
✅ Verification email sent successfully to john@example.com. Message ID: <id>
✅ Registration successful response returned
```

### Email Verification Logs
```
🔐 Email verification attempt with token
🔍 Finding user by verification token
✅ User found with verification token: <uuid>
📧 Updating email verification status for user: <uuid>
✅ Email verification updated for user: <uuid>
```

### Login Flow Logs
```
🔑 Login attempt for email: john@example.com
🔍 Finding user by email: john@example.com
✅ User found: <uuid>
🔐 Generating JWT token for user: john@example.com
✅ JWT token generated successfully for: john@example.com
✅ Login successful for email: john@example.com
```

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Email already registered | User exists | Use different email or login |
| Invalid credentials | Wrong password or email | Check email/password |
| Email not verified | Unverified email | Check verification link in email |
| Invalid token | Expired/incorrect token | Request new registration |
| Database connection error | DB not running | Start PostgreSQL service |

## Files Modified/Created

### New Files
- `src/mailer/mailer.service.ts` - Email service with Mailtrap integration
- `src/mailer/mailer.module.ts` - Mailer module configuration
- `src/auth/dto/verify-email.dto.ts` - Email verification DTO

### Modified Files
- `src/entities/user.entity.ts` - Added fullName, mobileNumber, isEmailVerified, emailVerificationToken
- `src/users/dto/create-user.dto.ts` - Added fullName, mobileNumber validation
- `src/auth/auth.service.ts` - Added register, verifyEmail, logging
- `src/auth/auth.controller.ts` - Added register, verify-email endpoints
- `src/users/users.service.ts` - Added verification token handling, logging
- `src/app.module.ts` - Added MailerModule, ConfigModule, database logging
- `src/auth/auth.module.ts` - Added MailerModule import
- `src/main.ts` - Enabled logger, added startup console logs
- `src/users/users.controller.ts` - Removed duplicate register endpoint
- `package.json` - Added nodemailer, @nestjs/config

## Testing

### Quick Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "mobileNumber": "+1234567890",
    "password": "TestPass123"
  }'

# 2. Verify Email (check Mailtrap inbox for token)
curl -X GET "http://localhost:2525/auth/verify-email?token=<token_from_email>"

# 3. Login
curl -X POST http://localhost:2525/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# 4. Get Profile (use token from login response)
curl -X GET http://localhost:2525/users/me \
  -H "Authorization: Bearer <access_token>"
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `psql -U postgres`
- Check `.env` database credentials
- Verify database `project` exists

### Email Not Sending
- Check Mailtrap credentials in code
- Verify internet connection
- Check Mailtrap inbox and spam folder
- Test connection in browser: `http://localhost:2525/mailer/test` (if exposed)

### Console Logs Not Showing
- Ensure logger is enabled in `main.ts`
- Check Node environment is not set to `production`
- Verify console output is not redirected

## Next Steps (Optional Enhancements)

1. **Password Reset** - Implement forgot password with token
2. **Rate Limiting** - Add rate limiting to endpoints
3. **Two-Factor Authentication** - Add 2FA for security
4. **Email Templates** - Use templates for better email formatting
5. **Refresh Tokens** - Implement refresh token rotation
6. **User Roles** - Add role-based access control (RBAC)
7. **API Documentation** - Add Swagger/OpenAPI documentation

## Support & Logs

All operations are logged to:
1. **Console** - Real-time logs with emojis and colors
2. **NestJS Logger** - Application logs
3. **Database** - Query logging enabled in TypeORM

Check the console output while running the application to see all operations in real-time.
