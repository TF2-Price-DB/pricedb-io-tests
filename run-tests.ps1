# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "`nRunning PriceDB.io Test Suite..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Run tests with verbose output
npm test -- --verbose

Write-Host "`nTest run completed!" -ForegroundColor Green
Write-Host "Check the output above for test results." -ForegroundColor Yellow
Write-Host "`nTo run specific test suites:" -ForegroundColor Cyan
Write-Host "npm test -- tests/website.test.js" -ForegroundColor White
Write-Host "npm test -- tests/websocket.test.js" -ForegroundColor White  
Write-Host "npm test -- tests/status-api.test.js" -ForegroundColor White
Write-Host "npm test -- tests/api.test.js" -ForegroundColor White
Write-Host "npm test -- tests/security.test.js" -ForegroundColor White
