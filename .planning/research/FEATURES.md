# Project Research: Features

## Ecosystem Context
Implementing Subscription billing (Razorpay) on a SaaS project.

## Table Stakes (Must Haves)
*Without these, the billing system is incomplete and untrustworthy.*
- **Subscription Creation**: Automatic instantiation of a Subscription Plan and returning a `subscription_id` to initialize the checkout.
- **Webhook Processing**: Validating inbound Razorpay server calls and honoring standard states (`subscription.charged`, `subscription.halted`, `subscription.cancelled`).
- **Signature Verification**: Every success loop (both frontend redirect and webhook) MUST be verified via HMAC SHA256 to ensure payload integrity against manual manipulation.

## Differentiators (Competitive Advantage)
*Features that elevate the UX.*
- **Synchronous Upgrades**: A dedicated success API immediately polling for verification upon checkout close, instantly unlocking the UI without forcing the user to "wait for the system to process."
- **Soft Downgrades**: Delaying plan termination until `current_period_end` utilizing the `isPro` middleware smartly.
- **In-App Retry UI**: Catching failures elegantly and allowing the user to select an alternative card instead of failing silently.

## Anti-Features (Do Not Build)
*Scope creep heavily affecting timelines.*
- **Global Multi-Currency (Stripe)**: Maintain primary focus on INR (₹) routing as building Stripe parallel tracks complicates schema enormously right now.
- **Proration Logistics**: Building complex logic to handle jumping between multiple tiers. Stick to the 1 tier (Pro - ₹299/mo).
