# Test VAPI Integration Script
# Run this script to test if VAPI calls your phone

Write-Host "🚀 Testing VAPI Integration..." -ForegroundColor Green
Write-Host ""

# Configuration
$phoneNumber = "+17788551600"  # Your Canadian phone number
$merchant = "Netflix"          # Test merchant
$baseUrl = "http://localhost:3000"

Write-Host "📱 Phone Number: $phoneNumber" -ForegroundColor Cyan
Write-Host "🏪 Merchant: $merchant" -ForegroundColor Cyan
Write-Host "🌐 Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host ""

# Check if Next.js server is running
Write-Host "🔍 Checking if Next.js server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl" -Method GET -TimeoutSec 5
    Write-Host "✅ Next.js server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Next.js server is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""

# Test VAPI Cancellation Call
Write-Host "🤖 Testing VAPI Cancellation Call..." -ForegroundColor Yellow
Write-Host "📞 This should call your phone: $phoneNumber" -ForegroundColor Cyan
Write-Host ""

$requestBody = @{
    detectionItemId = "test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    userId = "test-user-123"
    metadata = @{
        merchant = $merchant
        amount = 15.99
        date = (Get-Date).ToString("yyyy-MM-dd")
        accountLast4 = "1234"
        customPhoneNumber = $phoneNumber
    }
    reason = "Testing VAPI integration"
} | ConvertTo-Json -Depth 3

Write-Host "📤 Sending request to VAPI..." -ForegroundColor Yellow
Write-Host "Request Body: $requestBody" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cancelViaVapi" -Method POST -Body $requestBody -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "✅ VAPI Request Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Response Details:" -ForegroundColor Cyan
    Write-Host "Success: $($response.success)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "Call ID: $($response.callId)" -ForegroundColor White
    Write-Host "Phone Number: $($response.phoneNumber)" -ForegroundColor White
    Write-Host "Status: $($response.callStatus)" -ForegroundColor White
    Write-Host ""
    
    if ($response.success) {
        Write-Host "🎉 SUCCESS! VAPI call initiated successfully!" -ForegroundColor Green
        Write-Host "📱 Your phone ($phoneNumber) should ring within 30 seconds!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📞 What to expect:" -ForegroundColor Cyan
        Write-Host "   • Your phone will ring" -ForegroundColor White
        Write-Host "   • Answer the call" -ForegroundColor White
        Write-Host "   • Riley will introduce herself" -ForegroundColor White
        Write-Host "   • She'll handle the cancellation conversation" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Check VAPI Dashboard: https://dashboard.vapi.ai" -ForegroundColor Cyan
        Write-Host "📊 Check CloudWatch Logs for detailed debug info" -ForegroundColor Cyan
    } else {
        Write-Host "❌ VAPI call failed: $($response.error)" -ForegroundColor Red
        Write-Host "🔍 Check CloudWatch logs for more details" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error calling VAPI API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   • Make sure Amplify sandbox is running: npx ampx sandbox" -ForegroundColor White
    Write-Host "   • Make sure Next.js server is running: npm run dev" -ForegroundColor White
    Write-Host "   • Check CloudWatch logs for Lambda function errors" -ForegroundColor White
}

Write-Host ""
Write-Host "🏁 Test completed. Check your phone for the call!" -ForegroundColor Green
