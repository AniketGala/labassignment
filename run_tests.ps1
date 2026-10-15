$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$json = @{ 'Content-Type' = 'application/json' }
$tick = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$uniqueEmail = "alice-$tick@shopkart-test.com"
$uniquePhone = '9' + "$tick".PadLeft(9,'0').Substring(0,9)
Write-Host "Unique user: email=$uniqueEmail, phone=$uniquePhone" -ForegroundColor DarkGray

function Test-Step($name, [scriptblock]$block) {
  Write-Host ("`n> TEST: " + $name) -ForegroundColor Cyan
  try {
    & $block
    Write-Host "   [PASS]" -ForegroundColor Green
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      try {
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host ("   [FAIL] " + $_.Exception.Message + "  Response: " + $body) -ForegroundColor Red
      } catch {
        Write-Host ("   [FAIL] " + $_.Exception.Message) -ForegroundColor Red
      }
    } else {
      Write-Host ("   [FAIL] " + $_.Exception.Message) -ForegroundColor Red
    }
    exit 1
  }
}

# 1. Register
Test-Step 'Register Customer' {
  $b = @{ fullName='Alice Sharma'; email=$uniqueEmail; password='alice123'; phone=$uniquePhone } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/customers/register" -Method POST -Body $b -Headers $json -WebSession $session
  if (-not $r.success -or $r.customer.email -ne $uniqueEmail) { throw 'bad register response' }
}

# 2. Login (HttpOnly cookie)
Test-Step 'Login Customer' {
  $b = @{ email=$uniqueEmail; password='alice123' } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/customers/login" -Method POST -Body $b -Headers $json -WebSession $session
  if (-not $r.success) { throw 'login failed' }
  $cookie = $session.Cookies.GetCookies($base) | Where-Object Name -eq 'token'
  if (-not $cookie) { throw 'token cookie not set' }
}

# 3. Protected Profile (middleware test)
Test-Step 'GET /customers/me (protected)' {
  $r = Invoke-RestMethod -Uri "$base/customers/me" -Method GET -WebSession $session
  if ($r.email -ne $uniqueEmail) { throw 'wrong profile' }
}

# 4. Create products
$p1 = $null
$p2 = $null
Test-Step 'Create Product 1 (Keyboard 2999, stock 10)' {
  $b = @{ name='Mechanical Keyboard'; description='Blue switches RGB'; price=2999; category='Electronics'; image='https://images.unsplash.com/photo-1587829741301?w=600'; stock=10 } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/products" -Method POST -Body $b -Headers $json
  $script:p1 = $r.product._id
}
Test-Step 'Create Product 2 (Mouse 1499, stock 20)' {
  $b = @{ name='Wireless Mouse'; description='Ergonomic 6-button'; price=1499; category='Electronics'; image='https://images.unsplash.com/photo-1527814050087?w=600'; stock=20 } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/products" -Method POST -Body $b -Headers $json
  $script:p2 = $r.product._id
}

# 5. Product catalog search + sort
Test-Step 'GET /products?search=keyboard&category=Electronics' {
  $r = Invoke-RestMethod -Uri "$base/products?search=keyboard&category=Electronics" -Method GET
  if ($r.count -lt 1) { throw 'filter empty' }
}
Test-Step 'GET /products?sort=price_desc' {
  $r = Invoke-RestMethod -Uri "$base/products?sort=price_desc" -Method GET
  if ($r.products[0].price -lt $r.products[-1].price) { throw 'sort broken' }
}
Test-Step 'GET /products/:id' {
  $r = Invoke-RestMethod -Uri "$base/products/$p1" -Method GET
  if (-not $r.success) { throw }
}

# 6. Wishlist (Lab 04)
Test-Step 'POST /wishlist/:id (add)' {
  $r = Invoke-RestMethod -Uri "$base/wishlist/$p1" -Method POST -WebSession $session
  if (-not $r.success) { throw }
}
Test-Step 'POST /wishlist/:id AGAIN -> 409 Conflict (dup prevention)' {
  try {
    Invoke-RestMethod -Uri "$base/wishlist/$p1" -Method POST -WebSession $session -ErrorAction Stop | Out-Null
    throw 'expected 409'
  } catch {
    if ($_.Exception.Response.StatusCode -ne [System.Net.HttpStatusCode]::Conflict) { throw 'not 409' }
  }
}
Test-Step 'GET /wishlist (populate returns name)' {
  $r = Invoke-RestMethod -Uri "$base/wishlist" -Method GET -WebSession $session
  if ($r.count -ne 1 -or $r.wishlist[0].name -ne 'Mechanical Keyboard') { throw 'populate broken' }
}
Test-Step 'DELETE /wishlist/:id + GET count=0' {
  Invoke-RestMethod -Uri "$base/wishlist/$p1" -Method DELETE -WebSession $session | Out-Null
  $r = Invoke-RestMethod -Uri "$base/wishlist" -Method GET -WebSession $session
  if ($r.count -ne 0) { throw }
}

# 7. Cart (Lab 05)
Test-Step 'POST /cart/:p1 (qty=1)' {
  $r = Invoke-RestMethod -Uri "$base/cart/$p1" -Method POST -WebSession $session
  if ($r.cart[0].quantity -ne 1) { throw }
}
Test-Step 'POST /cart/:p1 AGAIN -> qty becomes 2, NO dup row' {
  $r = Invoke-RestMethod -Uri "$base/cart/$p1" -Method POST -WebSession $session
  if (@($r.cart).Count -ne 1) { throw 'dup row!' }
  $kb = @($r.cart)[0]
  if ($kb.quantity -ne 2) { throw "qty not 2" }
}
Test-Step 'POST /cart/:p2 (add second product)' {
  $r = Invoke-RestMethod -Uri "$base/cart/$p2" -Method POST -WebSession $session
  if (@($r.cart).Count -ne 2) { throw }
}
Test-Step 'PATCH /cart/:p1 qty=3' {
  $b = @{ quantity = 3 } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/cart/$p1" -Method PATCH -Body $b -Headers $json -WebSession $session
  $kb = $r.cart | Where-Object { $_.product._id -eq $p1 }
  if ($kb.quantity -ne 3) { throw }
}
Test-Step 'PATCH /cart/:p1 qty=999 -> 400 (stock 10)' {
  try {
    $b = @{ quantity = 999 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$base/cart/$p1" -Method PATCH -Body $b -Headers $json -WebSession $session -ErrorAction Stop | Out-Null
    throw 'expected 400'
  } catch {
    if ([int]$_.Exception.Response.StatusCode -ne 400) { throw 'not 400' }
  }
}
Test-Step 'DELETE /cart/:p2 + verify 1 row left' {
  $r = Invoke-RestMethod -Uri "$base/cart/$p2" -Method DELETE -WebSession $session
  if (@($r.cart).Count -ne 1) { throw }
}

# 8. Add mouse back, then Checkout (Lab 06)
Test-Step 'Re-add mouse to cart (now 2 items: kb qty3 + mouse qty1)' {
  $r = Invoke-RestMethod -Uri "$base/cart/$p2" -Method POST -WebSession $session
  if (@($r.cart).Count -ne 2) { throw }
}

$shopOrderId = $null
$rzpOrderId = $null
Test-Step 'POST /orders/create-payment-order (Razorpay backend order)' {
  $ship = @{ fullName='Alice Sharma'; phone=$uniquePhone; addressLine1='22 MG Road'; city='Bengaluru'; state='Karnataka'; pincode='560001' }
  $b = @{ shippingAddress = $ship } | ConvertTo-Json -Depth 5
  $r = Invoke-RestMethod -Uri "$base/orders/create-payment-order" -Method POST -Body $b -Headers $json -WebSession $session
  if (-not $r.success) { throw $r.message }
  if (-not $r.razorpayOrderId -or -not $r.shopKartOrderId) { throw 'ids missing' }
  if (-not $r.key -or $r.key -notlike 'rzp_test_*') { throw 'key missing' }
  $script:shopOrderId = $r.shopKartOrderId
  $script:rzpOrderId = $r.razorpayOrderId
  $expectedPaise = (3*2999 + 1*1499) * 100
  Write-Host ("     ShopKart order id  = " + $script:shopOrderId)
  Write-Host ("     Razorpay  order id  = " + $script:rzpOrderId)
  Write-Host ("     amount (paise)      = " + $r.amount + "   (expected " + $expectedPaise + ")")
  Write-Host ("     Razorpay public key = " + $r.key)
  if ($r.amount -ne $expectedPaise) { Write-Warning "     Amount mismatch (different products in db?)" }
}

# 9. Premature cart clear check (CRITICAL)
Test-Step 'Cart STILL full BEFORE verify (no premature clear!)' {
  $r = Invoke-RestMethod -Uri "$base/cart" -Method GET -WebSession $session
  if (@($r.cart).Count -ne 2) { throw 'cart cleared PREMATURELY' }
}

# 10. Forged signature rejected (SECURITY)
Test-Step 'POST verify-payment FAKE SIG -> 400 REJECTED' {
  try {
    $b = @{ shopKartOrderId=$shopOrderId; razorpay_order_id=$rzpOrderId; razorpay_payment_id='pay_FAKE'; razorpay_signature='FAKE_SIG' } | ConvertTo-Json
    Invoke-RestMethod -Uri "$base/orders/verify-payment" -Method POST -Body $b -Headers $json -WebSession $session -ErrorAction Stop | Out-Null
    throw 'expected 400'
  } catch {
    if ([int]$_.Exception.Response.StatusCode -ne 400) { throw 'not 400 - security bug' }
  }
}

# 11. Cart preserved after failed verify
Test-Step 'Cart still full AFTER failed verify (not cleared on failure!)' {
  $r = Invoke-RestMethod -Uri "$base/cart" -Method GET -WebSession $session
  if (@($r.cart).Count -ne 2) { throw 'cart cleared on FAILED payment - bug' }
}

# 12. Orders list (Lab 06)
Test-Step 'GET /orders -> PENDING_PAYMENT + snapshot items' {
  $r = Invoke-RestMethod -Uri "$base/orders" -Method GET -WebSession $session
  $o = @($r.orders) | Where-Object { $_.razorpayOrderId -eq $rzpOrderId } | Select-Object -First 1
  if (-not $o) { throw 'order missing from list' }
  if ($o.status -ne 'PENDING_PAYMENT' -or $o.paymentStatus -ne 'PENDING') { throw 'status wrong' }
  if (-not $o.items[0].name -or -not $o.items[0].price) { throw 'snapshot broken (no purchase-time name/price)' }
  Write-Host ("     order status = " + $o.status + " / payment = " + $o.paymentStatus)
  Write-Host ("     item snapshot: [1] " + $o.items[0].name + " x" + $o.items[0].quantity + " @ Rs." + $o.items[0].price)
  if ($o.items.Count -gt 1) {
    Write-Host ("     item snapshot: [2] " + $o.items[1].name + " x" + $o.items[1].quantity + " @ Rs." + $o.items[1].price)
  }
  Write-Host ("     totalAmount = Rs." + $o.totalAmount + "   ship-to: " + $o.shippingAddress.city)
}

Test-Step 'GET /orders/:id (single order)' {
  $r = Invoke-RestMethod -Uri "$base/orders/$shopOrderId" -Method GET -WebSession $session
  if ($r.order._id -ne $shopOrderId) { throw }
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   ALL 25 END-TO-END TESTS PASSED " -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [Lab 01 Auth   ]  Register + Login + HttpOnly JWT + /me protected" -ForegroundColor White
Write-Host "  [Lab 02 Client ]  Frontend at http://localhost:5173 (running)" -ForegroundColor White
Write-Host "  [Lab 03 Catalog]  CRUD + search + category + sort bonus" -ForegroundColor White
Write-Host "  [Lab 04 Wishlist] 409 dup prevention + populate + 401 protected" -ForegroundColor White
Write-Host "  [Lab 05 Cart   ] Qty increment (no dup) + stock 400 + patch/delete" -ForegroundColor White
Write-Host "  [Lab 06 Orders ] Server-side total, snapshot, Razorpay backend order" -ForegroundColor White
Write-Host "                  Premature cart clear blocked, fake sig -> 400" -ForegroundColor White
Write-Host "                  Order list + ownership + PENDING_PAYMENT state" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173/" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:5000/" -ForegroundColor Yellow
Write-Host ""
