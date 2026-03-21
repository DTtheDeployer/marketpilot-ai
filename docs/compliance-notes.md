# Compliance Notes

## Jurisdiction Handling

### Design Principles
- Paper trading is available to all users regardless of jurisdiction
- Live trading is gated behind jurisdiction eligibility checks
- No VPN bypass, geoblock circumvention, or evasion logic exists in the codebase
- Restricted users are routed to paper mode only
- Jurisdiction status is recorded in the user profile and checked at multiple gates

### Jurisdiction Check Flow
1. User selects country/region during onboarding
2. System records jurisdiction check with timestamp and IP
3. Status is set to ELIGIBLE, RESTRICTED, or PENDING_REVIEW
4. Live trading features are only accessible with ELIGIBLE status
5. Re-checks can be triggered by admin or on profile update

### Feature Gating by Jurisdiction
- **UNCHECKED**: Paper trading only. Prompted to complete check.
- **ELIGIBLE**: Full access based on subscription tier.
- **RESTRICTED**: Paper trading only. Clear messaging about restrictions.
- **PENDING_REVIEW**: Paper trading only. Notified when review completes.

## Risk Disclosures

### Required Acknowledgements
Before enabling any bot (paper or live):
- User must acknowledge that past performance does not guarantee future results
- User must acknowledge that prediction market trading involves risk of loss
- Acknowledgement is versioned and timestamped

Before enabling live trading:
- Additional disclosure about real financial risk
- Acknowledgement that the platform does not provide financial advice
- Acknowledgement of understanding of smart contract risks

### Disclosure Locations
- Onboarding flow (Step 3)
- Bot creation flow
- Live trading upgrade flow
- Pricing page footnotes
- Footer on all pages

## Marketing Language Guidelines

### Approved
- "Automated strategy platform"
- "Paper trading and live execution toolkit"
- "Strategy automation with risk controls"
- "Research, simulate, deploy, and monitor"

### Prohibited
- "Make money while you sleep"
- "Guaranteed returns"
- "Risk-free profits"
- "Easy income"
- Any language implying guaranteed or low-risk financial outcomes

## Data Handling
- IP addresses are logged for jurisdiction checks and audit trails
- Wallet addresses are stored for live trading connections
- No private keys are stored by the platform
- Payment data is handled entirely by Stripe (PCI compliant)
- User data can be exported or deleted upon request

## Regulatory Considerations
This platform is designed as a strategy automation tool. It does not:
- Provide financial advice
- Manage funds on behalf of users
- Pool user capital
- Operate as a broker or exchange
- Facilitate access to restricted markets

Users execute trades through their own Polymarket accounts and are responsible for compliance with their local regulations.
