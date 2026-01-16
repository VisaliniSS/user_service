# 🎯 System Architecture & Flow Diagrams

## 1. Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Registration Flow                   │
└─────────────────────────────────────────────────────────────┘

   CLIENT                          SERVER
     │                               │
     ├─ POST /auth/register ────────>│
     │  (fullName, email,             │
     │   mobileNumber,                │
     │   password)                    │
     │                              ┌─┴────────────────────┐
     │                              │ Validate Input       │
     │                              │ - Email format       │
     │                              │ - Phone format       │
     │                              │ - Password length    │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Check Duplicates     │
     │                              │ - Email unique?      │
     │                              │ - Mobile unique?     │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Generate            │
     │                              │ - Verification Token │
     │                              │ - Password Hash      │
     │                              │   (bcrypt x10)       │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Create User          │
     │                              │ - Save to DB         │
     │                              │ - isEmailVerified=no │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Send Email           │
     │                              │ - Via Mailtrap       │
     │                              │ - With verify link   │
     │                              └─┬────────────────────┘
     │                               │
     │<────── Response ──────────────│
     │ {userId, email, message}       │
     │                               │
     │                            📧 │ (Email sent)
     │                               │
     ├──────────────────────────────>│ Mailtrap
     │ (Check inbox for email)        │
     │                               │
```

---

## 2. Email Verification Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Email Verification Flow                         │
└─────────────────────────────────────────────────────────────┘

   CLIENT                          SERVER
     │                               │
     │ (Clicks link or copies token) │
     │                               │
     ├─ GET /auth/verify-email ────>│
     │  ?token=<verification_token>  │
     │                              ┌─┴────────────────────┐
     │                              │ Find User by Token   │
     │                              │ - Query DB           │
     │                              │ - Check token match  │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Check Status         │
     │                              │ - Is token valid?    │
     │                              │ - Is email verified? │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Update User          │
     │                              │ - isEmailVerified=yes│
     │                              │ - Clear token        │
     │                              └─┬────────────────────┘
     │                               │
     │<──── Response ─────────────────│
     │ {message: "Verified",          │
     │  email: "user@example.com"}    │
     │                               │
     ✅ Email verification complete!  │
     │                               │
```

---

## 3. Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Login Flow                                │
└─────────────────────────────────────────────────────────────┘

   CLIENT                          SERVER
     │                               │
     ├─ POST /auth/login ───────────>│
     │  (email, password)             │
     │                              ┌─┴────────────────────┐
     │                              │ Find User            │
     │                              │ - Query by email     │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Check Verification   │
     │                              │ - Is email verified? │
     │                              │ (If no → Error)      │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Verify Password      │
     │                              │ - Compare with hash  │
     │                              │ - Bcrypt compare     │
     │                              │ (If no → Error)      │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Generate JWT         │
     │                              │ - Payload:           │
     │                              │   {sub: id,          │
     │                              │    email: email,     │
     │                              │    role: role}       │
     │                              │ - Sign with secret   │
     │                              └─┬────────────────────┘
     │                               │
     │<──── Response ─────────────────│
     │ {access_token: "eyJ..."}       │
     │                               │
     ✅ Login successful!             │
     │ (Store token for future use)   │
     │                               │
```

---

## 4. Protected Route Access

```
┌─────────────────────────────────────────────────────────────┐
│          Protected Route Access (/users/me)                 │
└─────────────────────────────────────────────────────────────┘

   CLIENT                          SERVER
     │                               │
     ├─ GET /users/me ──────────────>│
     │  Headers: {                    │
     │    Authorization:              │
     │    Bearer <access_token>       │
     │  }                             │
     │                              ┌─┴────────────────────┐
     │                              │ JWT Guard            │
     │                              │ - Extract token      │
     │                              │ - Verify signature   │
     │                              │ - Check expiration   │
     │                              │ (If invalid → 401)   │
     │                              └─┬────────────────────┘
     │                               │
     │                              ┌─┴────────────────────┐
     │                              │ Get User Data        │
     │                              │ - Query DB by ID     │
     │                              │ - Omit password      │
     │                              └─┬────────────────────┘
     │                               │
     │<──── Response ─────────────────│
     │ {                              │
     │   id: "uuid",                  │
     │   fullName: "John Doe",        │
     │   email: "john@example.com",   │
     │   mobileNumber: "+1234567890", │
     │   role: "user",                │
     │   isEmailVerified: true,       │
     │   createdAt: "2026-01-16..."   │
     │ }                              │
     │                               │
     ✅ Profile retrieved!            │
     │                               │
```

---

## 5. Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│              Users Table Structure                           │
└─────────────────────────────────────────────────────────────┘

    USERS TABLE
┌──────────────────────────────────────┐
│ id (UUID, PK)                        │
├──────────────────────────────────────┤
│ fullName (String)                    │
│ email (String, UNIQUE)               │ ← Registration input
│ mobileNumber (String, UNIQUE)        │ ← Registration input
│ password (String, Hashed)            │ ← Bcrypt hashed
│ role (String, Default: 'user')       │
│ isEmailVerified (Boolean, Def: false)│ ← Verification flag
│ emailVerificationToken (String, NULL)│ ← Verification token
│ createdAt (Timestamp)                │
└──────────────────────────────────────┘

    INDEXES
├── idx_email (email)
├── idx_id (id)
└── idx_verification_token (emailVerificationToken)
```

---

## 6. Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Service Architecture                           │
└─────────────────────────────────────────────────────────────┘

HTTP Requests
    │
    ├──> AuthController
    │    ├─ POST /auth/register
    │    ├─ GET /auth/verify-email
    │    ├─ POST /auth/verify-email
    │    └─ POST /auth/login
    │
    ├──> UsersController
    │    └─ GET /users/me (Protected)
    │
    └──> JWT Guard (Middleware)

Services:
    │
    ├──> AuthService
    │    ├─ register()
    │    ├─ verifyEmail()
    │    ├─ login()
    │    └─ validateUser()
    │
    ├──> UsersService
    │    ├─ create()
    │    ├─ findByEmail()
    │    ├─ findById()
    │    ├─ findByVerificationToken()
    │    └─ updateEmailVerification()
    │
    └──> MailerService
         ├─ sendVerificationEmail()
         └─ testConnection()

Database:
    │
    └──> TypeORM
         └─ PostgreSQL (users table)
```

---

## 7. Console Logging Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            Console Logging Flow                              │
└─────────────────────────────────────────────────────────────┘

NESTJS LOGGER (Global)
    │
    ├─ Application Startup
    │  ├─ 🚀 Module Initialized
    │  ├─ 📦 Database Configuration
    │  └─ ✅ Mailtrap Configured
    │
    ├─ Controllers
    │  ├─ 📝 Registration attempt
    │  ├─ 🔑 Login attempt
    │  ├─ ✉️ Email verification attempt
    │  └─ 👤 Profile request
    │
    ├─ Services
    │  ├─ 🎫 Token generation
    │  ├─ 🔐 Password hashing
    │  ├─ 🔍 Database search
    │  ├─ ✅ Success events
    │  └─ ❌ Error events
    │
    └─ Mailer
       ├─ 📧 Email preparation
       ├─ 🌐 Mailtrap connection
       ├─ ✅ Email sent
       └─ ❌ Email failed

CONSOLE OUTPUT (Terminal)
    │
    └─ Real-time operation tracking
```

---

## 8. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│            Error Handling Flow                               │
└─────────────────────────────────────────────────────────────┘

Request
    │
    ├─> Validation Layer
    │   ├─ Invalid email? → 400 Bad Request
    │   ├─ Invalid phone? → 400 Bad Request
    │   └─ Password too short? → 400 Bad Request
    │
    ├─> Business Logic Layer
    │   ├─ Email already exists? → 400 Conflict
    │   ├─ User not found? → 401 Unauthorized
    │   ├─ Password mismatch? → 401 Unauthorized
    │   └─ Email not verified? → 400 Bad Request
    │
    ├─> Database Layer
    │   ├─ Connection error? → 500 Internal Error
    │   └─ Query error? → 500 Internal Error
    │
    ├─> Email Layer
    │   └─ Mailtrap error? → Log & Notify
    │
    └─> Response
        ├─ Success Response (200)
        ├─ Error Response (400/401/500)
        └─ Detailed Console Log
```

---

## 9. Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│              Security Layers                                 │
└─────────────────────────────────────────────────────────────┘

LAYER 1: Input Validation
    ├─ @IsEmail() - Email format
    ├─ @IsMobilePhone() - Phone format
    ├─ @MinLength(6) - Password length
    └─ @IsNotEmpty() - Required fields

LAYER 2: Business Logic
    ├─ Duplicate email check
    ├─ Duplicate mobile check
    └─ Email verification requirement

LAYER 3: Cryptography
    ├─ Bcrypt hashing (10 rounds)
    ├─ Secure password comparison
    └─ Random token generation

LAYER 4: Authentication
    ├─ JWT tokens with expiration
    ├─ Email verification tokens
    └─ JWT guard on protected routes

LAYER 5: Error Handling
    ├─ No sensitive data in responses
    ├─ Detailed console logging
    └─ User-friendly error messages
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            Deployment Architecture                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Local Development                │
├─────────────────────────────────────────┤
│ npm run start:dev (Watch mode)          │
│ ├─ Auto-compile on file change          │
│ ├─ Live reload enabled                  │
│ ├─ Console logs visible                 │
│ └─ Debug mode ready                     │
└──────────────┬──────────────────────────┘
               │
               │ (Deploy)
               │
┌──────────────▼──────────────────────────┐
│       Production Deployment              │
├─────────────────────────────────────────┤
│ npm run build (Compile)                 │
│ npm run start:prod (Optimized)          │
│ ├─ Compiled output in dist/             │
│ ├─ Environment variables from server    │
│ ├─ Database credentials secure          │
│ ├─ Logging configured                   │
│ └─ Ready for container/cloud            │
└─────────────────────────────────────────┘
```

---

## Summary

This comprehensive registration and login system includes:

- ✅ Complete user registration workflow
- ✅ Email verification process
- ✅ Secure user authentication
- ✅ JWT token management
- ✅ Comprehensive error handling
- ✅ Detailed console logging
- ✅ Multi-layer security
- ✅ Production-ready deployment

**All flows are implemented and ready to use!** 🚀
