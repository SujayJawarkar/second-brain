# Project Research: Architecture

## Architectural Boundaries

### 1. Plan Management (Initialization)
- Backend API must check Razorpay API to see if `Kortex Pro` plan exists.
- If missing, standardizes a Node.js singleton or initialization script to create it dynamically avoiding manual syncs securely.

### 2. Client-Server Flow 
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Razorpay
    
    User->>Frontend: Clicks "Subscribe"
    Frontend->>Backend: POST /billing/subscribe
    Backend->>Razorpay: orders/create (for Subscriptions)
    Razorpay-->>Backend: subscription_id
    Backend-->>Frontend: subscription_id
    Frontend->>Razorpay: Open Checkout UI
    Razorpay-->>User: Takes Payment
    Razorpay-->>Frontend: Success (razorpay_payment_id, signature)
    Frontend->>Backend: POST /billing/verify
    Backend->>Backend: Verify HMAC Signature
    Backend-->>Frontend: Success (updates UI to Pro)
```

### 3. Server-Server Flow (Webhooks)
```mermaid
sequenceDiagram
    participant Razorpay
    participant Backend
    participant PostgreSQL
    
    Razorpay->>Backend: Webhook POST (e.g. subscription.charged)
    Backend->>Backend: Verify `x-razorpay-signature`
    Backend->>PostgreSQL: Upsert Transaction & User Status updating `current_period_end`
    Backend-->>Razorpay: 200 OK
```

## Recommended Build Order
1. Setup local env vars mapping Razorpay Sandbox keys.
2. Initialize Backend API Endpoints (Plan check, Subscription Create).
3. Extend Drizzle PostgreSQL Schemas to support tracking values.
4. Setup Frontend hook + Razorpay UI component.
5. Create logic for Verification APIs and Webhooks endpoints. 
6. Map `Resend` emails to the Webhook handlers. 
