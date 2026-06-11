# Security Specification & Threat Model

This document outlines the security architecture, data invariants, and edge cases tested for the recovery and subscription stakes platform.

## 1. Data Invariants and Relational Safeguards
- **Identity Invariance**: A user profile or journal entry cannot be written if the `userId` in the payload does not match the active `request.auth.uid`.
- **Immutability of Ledger**: High-frequent micro-transactions (`stakes_payments`) can only be created by their respective owners. Once recorded, they can never be updated or deleted.
- **Strict Keys**: No "Ghost Fields" can be injected into any document via shadow updates.
- **Content Integrity**: Forum posts must fall within valid categories (`Drugs`, `Sex`, `Alcohol`, `General`) and have reasonable sizes to prevent denial-of-wallet resource fatigue.

---

## 2. The "Dirty Dozen" Payloads (Aesthetic Penetration Targets)
The following malicious payload attempts are designed to break the laws of Identity, Integrity, and State, and must be strictly blocked:

1. **Malicious Role Update**: Attacking own profile to bypass subscription limits.
2. **Ghost-Field Injection**: Appending `isAdmin: true` during profile creation.
3. **Transaction Hijack**: Creating a stakes payment pointing to a different `userId`.
4. **Transaction Alteration**: Attempting to update a transaction amount after creation.
5. **Private Journal Snatching**: Non-owner trying to direct-read a private therapist journal entry.
6. **Alias Spoofing**: Submitting a post using someone else's authenticated profile.
7. **Negative High-Stake Hack**: Submitting a negative payment value (e.g. `-100sh`) to manipulate balances.
8. **Billion Likes Injection**: Directly updating list queries with `likesCount: 999999`.
9. **Junk Character Poisoning**: Using a 10KB string of non-printable characters as a document ID.
10. **Orphaned Post Creation**: Posting to a community section with an invalid userId.
11. **Malicious State Transition**: Updating a journal entry's creator to somebody else.
12. **Blanket Query Scraping**: Forcing a read of all private journal databases by bypassing `where` filtering.

---

## 3. Test Cases (TDD Definition)
Every single attempt from the "Dirty Dozen" must return `PERMISSION_DENIED` under all conditions. Rules are designed with a zero-trust architecture.
