# Project Research: Pitfalls

## Common Domain Mistakes & Gotchas

### 1. Trusting Client Payloads
- **Warning Sign**: An API endpoint updates a user to "Pro" solely trusting `payment_id` sent from the frontend without hashing to match the signature.
- **Prevention Strategy**: NEVER trust the frontend success callback. ALWAYS demand `razorpay_subscription_id`, `razorpay_payment_id`, and `razorpay_signature` together to hash locally using `crypto` against your Razorpay Secret.
- **Phase Resolution**: Implement security in the Verification endpoint phase.

### 2. Webhook Timeouts / Duplicate Processing
- **Warning Sign**: Sending users multiple identical "Welcome to Pro" emails, or tracking duplicate invoice records because Razorpay retried the webhook.
- **Prevention Strategy**: Webhooks MUST be idempotent. Check if the `transaction_id` or `payment_id` has already been processed in the database before updating logic. ALWAYS return `200 OK` to the webhook immediately before running heavy DB processes (or push the payload to a redis queue).
- **Phase Resolution**: Implement uniqueness constraints in Drizzle schemas & defer background actions in Webhook listeners.

### 3. Out-Of-Sync Plan Configurations
- **Warning Sign**: Frontend expects a payment amount but backend defines a different one on subscription creation.
- **Prevention Strategy**: Centralize pricing constants inside the Backend's `env` or configuration file to serve as the single source of truth dictating the plan creation payload dynamically. 
- **Phase Resolution**: Handle in Plan Initialization Logic phase.

### 4. Premature Downgrades
- **Warning Sign**: Subscriptions marked as "cancelled" instantly strip feature access.
- **Prevention Strategy**: Treat cancellation simply as disabling "auto-renew". Base all feature access checks on if `current_period_end` > `now()`.
- **Phase Resolution**: Handle via updates in the `requirePro` middleware phase.
