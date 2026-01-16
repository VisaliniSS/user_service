# 🎯 QUICK START GUIDE - Registration & Login System

## 🚀 Start in 5 Steps

### Step 1: Install Dependencies ✅ (Already Done)
```bash
npm install
```

### Step 2: Start PostgreSQL Database
```bash
# Windows - Open Services or Command Prompt
net start PostgreSQL
# OR use PostgreSQL App/Service

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Step 3: Verify .env Configuration ✅ (Already Set)
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD="Pass@1234"
DB_NAME=project
JWT_SECRET=IBIL_GLOBAL_SECRET
PORT=2525
```

### Step 4: Start Development Server
```bash
npm run start:dev
```

### Step 5: Test the API
Open new terminal:
```bash
# Windows
.\test-api.bat

# Linux/Mac
bash test-api.sh

# OR use curl
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","mobileNumber":"+1234567890","password":"TestPass@123"}'
```

---

## 📧 Mailtrap Setup

1. Go to: https://mailtrap.io
2. Check your inbox for verification emails
3. Copy verification token from email link
4. Use token to verify email:
```bash
curl "http://localhost:2525/auth/verify-email?token=YOUR_TOKEN"
```

---

## 🔄 Complete Registration Flow

```
1. REGISTER
   POST /auth/register
   ├─ fullName: "John Doe"
   ├─ email: "john@example.com"
   ├─ mobileNumber: "+1234567890"
   └─ password: "SecurePass@123"
   ↓
   ✅ Response: { userId, email, message }

2. WAIT FOR EMAIL
   ├─ Check Mailtrap inbox
   ├─ Open verification email
   └─ Copy token from link

3. VERIFY EMAIL
   GET /auth/verify-email?token=<TOKEN>
   ↓
   ✅ Email verified successfully

4. LOGIN
   POST /auth/login
   ├─ email: "john@example.com"
   └─ password: "SecurePass@123"
   ↓
   ✅ Response: { access_token }

5. USE ACCESS TOKEN
   GET /users/me
   Header: Authorization: Bearer <access_token>
   ↓
   ✅ Returns: { id, fullName, email, ... }
```

---

## 📋 All API Endpoints

| No | Method | Endpoint | Body | Response |
|----|--------|----------|------|----------|
| 1 | POST | `/auth/register` | fullName, email, mobileNumber, password | userId, email, message |
| 2 | GET | `/auth/verify-email` | ?token=... | message, email |
| 3 | POST | `/auth/verify-email` | token | message, email |
| 4 | POST | `/auth/login` | email, password | access_token |
| 5 | GET | `/users/me` | (JWT required) | User object |

---

## 🔐 Security Features

✅ **Password Hashing** - Bcrypt with 10 rounds  
✅ **Email Verification** - Required before login  
✅ **JWT Tokens** - Secure token-based auth  
✅ **Input Validation** - Email, mobile, password checks  
✅ **Error Handling** - Detailed error messages  
✅ **Logging** - All operations logged  

---

## 📊 Console Logs

Open the terminal running `npm run start:dev` to see:

```
✅ Application started
🚀 Database connected
✅ Mailtrap configured

[User Actions]
📝 Registration attempt
✅ User created
📧 Email sent
🔑 Login attempt
✅ Login successful
✉️ Email verified
```

---

## 🧪 Testing with Postman/Insomnia

### Request 1: Register
```
POST http://localhost:2525/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "+1-234-567-8900",
  "password": "SecurePassword@123"
}
```

### Request 2: Verify Email (from Mailtrap token)
```
GET http://localhost:2525/auth/verify-email?token=<copied_token_from_email>
```

### Request 3: Login
```
POST http://localhost:2525/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword@123"
}
```

### Request 4: Get Profile
```
GET http://localhost:2525/users/me
Authorization: Bearer <access_token_from_login_response>
```

---

## ❌ Common Issues & Fixes

| Issue | Error | Fix |
|-------|-------|-----|
| DB not running | `ECONNREFUSED 127.0.0.1:5432` | Start PostgreSQL service |
| Email not sent | No email in Mailtrap | Check internet, verify Mailtrap credentials |
| Port in use | `Port 2525 already in use` | Kill process: `taskkill /F /IM node.exe` |
| Build error | TypeScript errors | Run `npm run build` for details |
| Email not verified | `Email not verified` | Use verification link from Mailtrap email |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/auth/auth.controller.ts` | API endpoints |
| `src/auth/auth.service.ts` | Registration/login logic |
| `src/mailer/mailer.service.ts` | Email sending |
| `src/users/users.service.ts` | User management |
| `src/entities/user.entity.ts` | Database schema |
| `.env` | Configuration |

---

## 🎓 Example Walkthroughs

### Test Case 1: Full Registration → Verification → Login

```bash
# Terminal 1: Start server
npm run start:dev

# Terminal 2: Register
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Smith",
    "email": "alice@test.com",
    "mobileNumber": "+1-800-555-0123",
    "password": "Alice@Pass123"
  }'

# Response: { userId: "...", email: "alice@test.com", message: "..." }
```

**In Mailtrap:**
- Open https://mailtrap.io
- Find email from alice@test.com
- Copy verification token from link
- Token looks like: `a1b2c3d4e5f6...`

```bash
# Terminal 2: Verify email
curl "http://localhost:2525/auth/verify-email?token=a1b2c3d4e5f6..."

# Response: { message: "Email verified successfully", email: "alice@test.com" }
```

```bash
# Terminal 2: Login
curl -X POST http://localhost:2525/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "Alice@Pass123"
  }'

# Response: { access_token: "eyJhbGciOi..." }
```

```bash
# Terminal 2: Get profile
curl http://localhost:2525/users/me \
  -H "Authorization: Bearer eyJhbGciOi..."

# Response: { id: "...", fullName: "Alice Smith", email: "alice@test.com", ... }
```

---

### Test Case 2: Validation Error

```bash
# Missing fullName
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@test.com",
    "mobileNumber": "+1-800-555-0124",
    "password": "Bob@Pass123"
  }'

# Response: Error - fullName is required
```

---

### Test Case 3: Login Before Verification

```bash
# Register (but don't verify)
curl -X POST http://localhost:2525/auth/register ...

# Try to login
curl -X POST http://localhost:2525/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass@123"
  }'

# Response: Error - "Please verify your email first"
```

---

## 📚 Documentation Files

| File | Read For |
|------|----------|
| `DEPLOYMENT_READY.md` | Production setup & deployment |
| `REGISTRATION_LOGIN_GUIDE.md` | Complete API documentation |
| `IMPLEMENTATION_SUMMARY.md` | Technical overview |
| `PROJECT_STRUCTURE.md` | Folder structure & changes |
| `README.md` | Project basics |

---

## ⚡ Useful Commands

```bash
# Development
npm run start:dev              # Start with auto-reload
npm run build                  # Build project
npm run start:prod            # Start production build

# Testing
npm run test                   # Run unit tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage

# Code Quality
npm run lint                   # Run ESLint
npm run format                 # Format code with Prettier

# Database
npm run typeorm migration:run  # Run migrations (if applicable)
```

---

## 🎯 Key Points to Remember

1. ✅ **Verify Email First** - Users MUST verify email before login
2. ✅ **Check Mailtrap** - All emails go to Mailtrap (not real email)
3. ✅ **Database Required** - PostgreSQL must be running
4. ✅ **Console Logs** - Check terminal for detailed operation logs
5. ✅ **Save Tokens** - Store JWT token for API calls

---

## 🆘 Need Help?

1. **Check Console Logs** - Terminal shows all operations
2. **Read Documentation** - See REGISTRATION_LOGIN_GUIDE.md
3. **Check Mailtrap** - Verify emails are being sent
4. **Verify .env** - Ensure database credentials are correct
5. **Restart Server** - Try restarting `npm run start:dev`

---

## 🎉 You're Ready!

Your complete registration and login system is ready to use.

**Next Step:** Run `npm run start:dev` and test with `test-api.bat` (Windows) or `test-api.sh` (Linux/Mac)

---

*Created: January 16, 2026*  
*Status: ✅ Production Ready*
