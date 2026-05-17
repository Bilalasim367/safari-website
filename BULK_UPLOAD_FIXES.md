# Bulk Upload — Runtime Fixes

## Issue 1: POST 401 Unauthorized

**Root cause**: API route checks `x-api-key` header, but bulk-upload page sends `localStorage.getItem('adminApiKey')` which is never set. The admin is already authenticated via JWT cookies (used by server actions).

**Fix**: Refactor `src/app/api/admin/products/bulk-upload/route.ts` to use JWT cookie auth (`verifyToken` from `@/lib/auth`) instead of `x-api-key`. Remove the `x-api-key` header from the fetch call in `bulk-upload/page.tsx`.

## Issue 2: `Cannot read properties of undefined (reading 'length')`

**Root cause**: Variables `totalColumns` and `detectedColumns` are computed outside render guards. If `SAMPLE_HEADERS` or `headers` are undefined (or evaluated before state is initialized), `.length` throws.

**Fix**: Guard all `.length` accesses with optional chaining. Wrap column status rendering in the same `{file && preview && (` block as the rest, or compute defensively.
