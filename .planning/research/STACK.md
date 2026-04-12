# Project Research: Stack

## Rationale
Adding Razorpay subscriptions to the existing Express/Node.js + React architecture. The goal is robust, secure billing processing minimizing manual operational overhead.

## Recommended Tools & Libraries

### 1. `razorpay` (Node.js SDK)
- **Version**: `^2.9.6` (already in `backend/package.json`)
- **Why**: Official SDK provided by Razorpay to instantiate subscription endpoints securely from the backend server.
- **Alternatives Rejected**: Writing raw HTTP Axios requests to Razorpay APIs (SDK handles auth and standard mappings perfectly).

### 2. Frontend Razorpay Checkout (`checkout.js`)
- **Version**: Loaded dynamically via `<script>` tag or via `react-razorpay` library wrapper.
- **Confidence**: High
- **Why**: The standard flow requires invoking the Razorpay checkout overlay. It securely tokenizes cards without sending PAN data to our Express servers, avoiding PCI DSS headaches.

### 3. Node.js `crypto`
- **Version**: Built-in
- **Why**: Strictly necessary for webhook signature verification using `HmacSHA256`. 
- **Confidence**: Absolute requirement. Cannot use basic string comparisons for webhooks.

### 4. Background Jobs (Redis)
- **Why**: Webhooks from Razorpay must be responded to with `200 OK` instantaneously, and the DB operations should ideally be pushed to our existing `ioredis` workers to avoid timeout retries from Razorpay's end if DB load is momentarily high.
