@echo off
REM User Service - Registration & Login API Test Cases
REM Run these commands to test the complete flow

echo.
echo ======================================
echo User Service - Registration ^& Login Tests
echo ======================================
echo Base URL: http://localhost:2525
echo.

REM Test 1: Registration
echo TEST 1: User Registration
echo ---
echo Sending POST /auth/register
curl -X POST http://localhost:2525/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"John Doe\", \"email\": \"john.doe@example.com\", \"mobileNumber\": \"+1234567890\", \"password\": \"SecurePass@123\"}"

echo.
echo.

REM Test 2: Try registering with same email
echo TEST 2: Duplicate Email Registration ^(Should Fail^)
echo ---
curl -X POST http://localhost:2525/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"Jane Doe\", \"email\": \"john.doe@example.com\", \"mobileNumber\": \"+9876543210\", \"password\": \"AnotherPass@123\"}"

echo.
echo.

REM Test 3: Try login before verification
echo TEST 3: Login Before Email Verification ^(Should Fail^)
echo ---
curl -X POST http://localhost:2525/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"john.doe@example.com\", \"password\": \"SecurePass@123\"}"

echo.
echo.

REM Test 4: Invalid login credentials
echo TEST 4: Invalid Login Credentials
echo ---
curl -X POST http://localhost:2525/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"john.doe@example.com\", \"password\": \"WrongPassword123\"}"

echo.
echo.

REM Test 5: Register another user
echo TEST 5: Register Another User
echo ---
curl -X POST http://localhost:2525/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"Jane Smith\", \"email\": \"jane.smith@example.com\", \"mobileNumber\": \"+9876543210\", \"password\": \"SecurePass@456\"}"

echo.
echo.

REM Test 6: Validation error - Missing fullName
echo TEST 6: Validation Error - Missing fullName
echo ---
curl -X POST http://localhost:2525/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"test@example.com\", \"mobileNumber\": \"+1111111111\", \"password\": \"SecurePass@123\"}"

echo.
echo.

REM Test 7: Invalid email format
echo TEST 7: Invalid Email Format
echo ---
curl -X POST http://localhost:2525/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\": \"Invalid User\", \"email\": \"not-an-email\", \"mobileNumber\": \"+1234567890\", \"password\": \"SecurePass@123\"}"

echo.
echo ======================================
echo Test Suite Completed
echo ======================================
echo.
echo NEXT STEPS:
echo 1. Check Mailtrap inbox for verification email
echo 2. Copy verification token from email link
echo 3. Run: curl "http://localhost:2525/auth/verify-email?token=YOUR_TOKEN"
echo 4. Then login with verified account
echo 5. Use returned access_token to access protected routes
echo.
