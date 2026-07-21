# RULES.md

# Safari Perfumes E-Commerce Development Rules

These rules must be followed before making ANY code changes.

Failure to follow these rules may introduce bugs, break filtering, create data inconsistencies, or cause production issues.

---

# Rule 1: Analyze Before Coding

Never start coding immediately.

Always:

1. Analyze the entire feature.
2. Trace the data flow.
3. Understand the architecture.
4. Identify the root cause.
5. Document findings.
6. Then implement fixes.

Do not guess.

Do not assume.

Verify everything from the codebase.

---

# Rule 2: Find Root Cause

Never fix symptoms.

Always determine:

* Why the issue exists.
* Where the issue originates.
* Which layer is responsible.

Possible layers:

* Database
* Backend
* API
* Frontend
* Admin Panel

The actual root cause must be identified before any implementation begins.

---

# Rule 3: Read Existing Code First

Before modifying any file:

Review all related files.

Examples:

Product Filter Issue:

Read:

* Product Schema
* Product Model
* Product Service
* Product Controller
* Product APIs
* Navbar
* Product Pages
* Collection Pages
* Admin Product Form

Do not modify files blindly.

---

# Rule 4: Verify Data Flow

Always trace:

Database
→ Backend Query
→ API Response
→ Frontend Request
→ Product Rendering

Confirm each step works correctly.

---

# Rule 5: Single Source of Truth

Avoid duplicate logic.

Every business rule must have a single authoritative source.

Example:

Gender filtering must use ONE field only.

Either:

gender

OR

categorySlug

Not both.

Choose one and standardize the entire application.

---

# Rule 6: Database First

Before fixing frontend issues:

Verify database records.

Check:

* Missing values
* Invalid values
* Duplicate values
* Capitalization issues
* Legacy data

Examples:

Wrong:

Men
men
MEN

Correct:

men

Use one consistent format.

---

# Rule 7: Normalize Data

All stored values must be normalized.

Examples:

Gender:

* men
* women
* unisex

Type:

* attar
* perfume

Booleans:

* true
* false

Do not allow multiple formats.

---

# Rule 8: No Hardcoded Filters

Never hardcode product filtering.

Wrong:

if(category === "Men")

Correct:

Dynamic database-driven filtering.

---

# Rule 9: Backend Owns Filtering

Filtering should happen on the backend whenever possible.

Avoid:

* Fetching all products
* Filtering on frontend

Preferred:

Database Query
→ API Response
→ Display Results

---

# Rule 10: No Duplicate Filtering Logic

Do not implement the same business logic in multiple places.

Keep filtering centralized.

Example:

ProductService

instead of:

Navbar
+
Page
+
Component
+
API

all performing separate filtering.

---

# Rule 11: Validate Admin Data

Admin panel must save data exactly as required by filters.

Verify:

* gender
* type
* collection
* bestseller
* new arrival
* offer
* bundle

before saving.

---

# Rule 12: Protect Existing Features

Before changing code:

Identify:

* Dependencies
* Shared Components
* Reusable APIs

Ensure new changes do not break:

* Product Pages
* Search
* Categories
* Collections
* Admin Panel

---

# Rule 13: Production-Ready Code Only

Avoid:

* Quick fixes
* Temporary hacks
* Debug-only solutions

Implement scalable solutions.

Assume:

* Thousands of products
* Thousands of users

---

# Rule 14: Database Migration Safety

Before modifying schemas:

Review:

* Existing records
* Backward compatibility
* Data migration impact

Provide migration scripts if needed.

---

# Rule 15: Performance Review Required

Every fix must include:

Database:

* Query optimization
* Index recommendations

Backend:

* Efficient API responses

Frontend:

* Avoid unnecessary re-renders
* Avoid duplicate requests

---

# Rule 16: Verify Every Navbar Route

Navbar items:

* Bestsellers
* New Arrival
* Our Collection
* Attar Collection
* Perfumes Collection
* Bundles / Offers

Must be tested individually.

Each route must return correct products.

---

# Rule 17: Verify Every Product Collection

Test:

* Men
* Women
* Unisex
* Bestsellers
* New Arrival
* Attar Collection
* Perfumes Collection
* Bundles / Offers

No collection should display incorrect products.

---

# Rule 18: No Silent Failures

If data is invalid:

* Log error
* Return meaningful response
* Handle gracefully

Do not silently return all products.

---

# Rule 19: Test Before Completion

Before marking task complete:

Verify:

✅ API filters

✅ Database records

✅ Admin panel save

✅ Product updates

✅ Navbar routes

✅ Collection pages

✅ Search functionality

✅ Pagination

✅ Product counts

---

# Rule 20: Required Response Format

For every issue provide:

## Analysis

## Root Cause

## Files Reviewed

## Files Modified

## Database Changes

## Backend Changes

## Frontend Changes

## Verification Steps

## Risks

## Final Solution

Do not skip analysis.

Do not skip root cause identification.

Do not start implementation until the system has been fully understood.

---

# Mandatory Workflow

Step 1:
Analyze entire application.

Step 2:
Trace data flow.

Step 3:
Identify root cause.

Step 4:
Create implementation plan.

Step 5:
Implement fixes.

Step 6:
Run verification.

Step 7:
Document results.

Only after all steps pass should the task be considered complete.
