#!/bin/bash

# User Service - Registration & Login API Test Cases
# Run these commands to test the complete flow

echo "======================================"
echo "User Service - Registration & Login Tests"
echo "======================================"
echo "Base URL: http://localhost:2525"
echo ""

# Test 1: Registration
echo "📝 TEST 1: User Registration"
echo "---"
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+1234567890",
    "password": "SecurePass@123"
  }' | jq .

echo ""
echo ""

# Test 2: Try registering with same email (should fail)
echo "📝 TEST 2: Duplicate Email Registration (Should Fail)"
echo "---"
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+9876543210",
    "password": "AnotherPass@123"
  }' | jq .

echo ""
echo ""

# Test 3: Try login before verification (should fail)
echo "🔑 TEST 3: Login Before Email Verification (Should Fail)"
echo "---"
curl -X POST http://localhost:2525/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass@123"
  }' | jq .

echo ""
echo ""

# Test 4: Email Verification (use token from Mailtrap)
echo "✉️ TEST 4: Verify Email"
echo "---"
echo "Note: Replace <VERIFICATION_TOKEN> with token from Mailtrap inbox"
echo ""
# Uncomment and run after getting token from email
# VERIFICATION_TOKEN="<paste_token_here>"
# curl -X GET "http://localhost:2525/auth/verify-email?token=$VERIFICATION_TOKEN" | jq .

echo ""
echo ""

# Test 5: Login after verification
echo "🔑 TEST 5: Login After Email Verification"
echo "---"
echo "Note: Run this after verifying email in test 4"
echo ""
curl -X POST http://localhost:2525/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass@123"
  }' | jq .

echo ""
echo ""

# Test 6: Get User Profile
echo "👤 TEST 6: Get User Profile (Protected Route)"
echo "---"
echo "Note: Replace <ACCESS_TOKEN> with token from login response"
echo ""
# Uncomment and run after getting token from login
# ACCESS_TOKEN="<paste_token_here>"
# curl -X GET http://localhost:2525/users/me \
#   -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo ""
echo ""

# Test 7: Invalid login credentials
echo "❌ TEST 7: Invalid Login Credentials"
echo "---"
curl -X POST http://localhost:2525/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword123"
  }' | jq .

echo ""
echo ""

# Test 8: Register another user
echo "📝 TEST 8: Register Another User"
echo "---"
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "mobileNumber": "+9876543210",
    "password": "SecurePass@456"
  }' | jq .

echo ""
echo ""

# Test 9: Validation errors
echo "⚠️ TEST 9: Validation Errors"
echo "---"
echo "Missing fullName:"
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mobileNumber": "+1111111111",
    "password": "SecurePass@123"
  }' | jq .

echo ""
echo ""

# Test 10: Invalid email format
echo "⚠️ TEST 10: Invalid Email Format"
echo "---"
curl -X POST http://localhost:2525/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Invalid User",
    "email": "not-an-email",
    "mobileNumber": "+1234567890",
    "password": "SecurePass@123"
  }' | jq .

echo ""
echo "======================================"
echo "Test Suite Completed"
echo "======================================"
