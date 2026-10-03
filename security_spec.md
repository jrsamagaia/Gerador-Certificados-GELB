# Security Specification & Threat Model

## Data Invariants
1. A Certificate Template must have a valid non-empty id, name, category, model, and fileName.
2. A Template Chunk must reference an existing valid templateId and maintain positive integer chunkIndex and totalChunks.
3. Published Certificate Templates are read-accessible to users across devices (including incognito and external computers) for certificate generation and verification.
4. Mutation operations (create, update, delete) on templates and chunks require an authenticated user.
5. All document IDs must conform to alphanumeric and hyphen/underscore pattern `^[a-zA-Z0-9_\-]+$` and size <= 128 chars to prevent ID poisoning.

## The Dirty Dozen Payloads (Rejection Matrix)
1. Missing Required Keys: Creating a template without `name` or `category` -> PERMISSION_DENIED.
2. Shadow Field Injection: Adding unknown properties like `{ "__admin": true }` to a template -> PERMISSION_DENIED.
3. ID Poisoning: Supplying a 2KB junk string as `templateId` -> PERMISSION_DENIED.
4. Oversized String Attack: Sending a `name` exceeding 200 characters -> PERMISSION_DENIED.
5. Unauthenticated Write: Submitting a create/update/delete without `request.auth` -> PERMISSION_DENIED.
6. Chunk Index Corruption: Chunk with negative index or `chunkIndex >= totalChunks` -> PERMISSION_DENIED.
7. Mismatched Chunk Reference: Chunk with `templateId` differing from parent document ID -> PERMISSION_DENIED.
8. Unbounded Array Exploitation: Injecting large arrays into template document -> PERMISSION_DENIED.
9. Settings Tampering: Unauthenticated write to `/settings/gelb` -> PERMISSION_DENIED.
10. Immutable Field Modification: Updating immutable identifiers like `templateId` -> PERMISSION_DENIED.
11. Oversized Chunk Data: Submitting chunk payload larger than 800,000 characters -> PERMISSION_DENIED.
12. Invalid Orientation Value: Setting orientation to an invalid string like `"upside-down"` -> PERMISSION_DENIED.
