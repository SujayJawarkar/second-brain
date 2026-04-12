# Requirements: Kortex Razorpay Subscription

**Defined:** 2026-04-12
**Core Value:** Secure, reliable, and frictionless payment processing that converts free users into Pro users without disruption, serving as the monetization engine of Kortex.

## v1 Requirements

### Subscription Management

- [ ] **SUBS-01**: Modify Drizzle `users` schema to include `razorpay_customer_id`, `razorpay_subscription_id`, `subscription_status`, and `current_period_end`.
- [ ] **SUBS-02**: Backend initialization logic must check for the Pro Tier (₹299/month) Plan and dynamically create it via Razorpay API if missing.

### Checkout & Verification

- [ ] **CHKT-01**: Implement `POST /api/v1/billing/subscribe` which creates a Razorpay subscription and returns the `subscription_id` to initialize frontend checkout.
- [ ] **CHKT-02**: Implement `POST /api/v1/billing/verify` API for instant validation of `payment_id`, `subscription_id`, and HMAC `signature` directly from the frontend callback.

### Webhooks & Background Actions

- [ ] **WHKS-01**: Implement `POST /api/v1/billing/webhook` with strict `x-razorpay-signature` validation.
- [ ] **WHKS-02**: Handle `subscription.charged` webhook to upsert `subscription_status=active` and `current_period_end`.
- [ ] **WHKS-03**: Handle `subscription.cancelled` and `subscription.halted` webhooks.
- [ ] **WHKS-04**: Send transactional emails using Resend upon Success, Failure, and Cancellation webhooks.

### User Experience & UI

- [ ] **UIUX-01**: Integrate Razorpay checkout script into a Payment Modal or Billing wrapper triggered by `subscription_id`.
- [ ] **UIUX-02**: Handle payment failures in the checkout flow gracefully, allowing the user to select an alternative card/retry or cancel entirely.
- [ ] **UIUX-03**: Render a "Billing History" table in the user settings dashboard fetching past payment/invoice states.
- [ ] **UIUX-04**: If an active subscriber clicks "Subscribe", block the backend creation, return a "You are already subscribed" message, and safely redirect them to the Plan/Billing page.

### Security & Access

- [ ] **SECR-01**: Update the existing `requirePro` Express middleware to evaluate access explicitly against `current_period_end` allowing users to finish their cancellation billing cycle without immediate lockouts.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Proration & Multi-Tier upgrades | Currently only one tier exists (Pro). No need for proration mathematics. |
| Automatic Multi-Currency Conversions | The product is focused mainly on the Indian market (INR natively supported by Razorpay). Complex global gateways (Stripe mapping) are deferred. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUBS-01 | Pending | Pending |
| SUBS-02 | Pending | Pending |
| CHKT-01 | Pending | Pending |
| CHKT-02 | Pending | Pending |
| WHKS-01 | Pending | Pending |
| WHKS-02 | Pending | Pending |
| WHKS-03 | Pending | Pending |
| WHKS-04 | Pending | Pending |
| UIUX-01 | Pending | Pending |
| UIUX-02 | Pending | Pending |
| UIUX-03 | Pending | Pending |
| UIUX-04 | Pending | Pending |
| SECR-01 | Pending | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 0
- Unmapped: 13 ⚠️

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after initial definition*
