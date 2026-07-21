# PRD - Product Filtering & Collection System Fix

## Project

Safari Perfumes E-commerce Website

## Objective

Fix the complete product filtering and collection system across the entire application.

The current implementation displays incorrect products across collections and navbar sections. Users cannot reliably browse products by gender, collection, type, bestseller status, or new arrival status.

The goal is to establish a single, scalable filtering architecture that works consistently across the database, backend APIs, frontend pages, and admin panel.

---

# Current Problems

## Gender Collections

Products are assigned to:

* Men
* Women
* Unisex

Current behavior:

* Men page displays Women products.
* Women page displays Men products.
* Unisex page displays unrelated products.
* Same product appears in multiple collections.
* Filtering is inconsistent.

Expected behavior:

* Men page shows only Men products.
* Women page shows only Women products.
* Unisex page shows only Unisex products.

---

## Navbar Collection Filters

Navbar contains:

* Bestsellers
* New Arrival
* Our Collection
* Attar Collection
* Perfumes Collection
* Bundles / Offers

Current behavior:

* Links open pages.
* Filters do not work correctly.
* Incorrect products are displayed.
* Some pages show all products.

Expected behavior:

### Bestsellers

Show only products where:

isBestseller = true

### New Arrival

Show only products where:

isNewArrival = true

### Attar Collection

Show only:

type = Attar

### Perfumes Collection

Show only:

type = Perfume

### Bundles / Offers

Show only products marked as:

* bundle
  or
* offer

according to business rules.

### Our Collection

Show only products belonging to the collection.

---

# Investigation Requirements

The AI must perform a complete project audit before making any changes.

No coding should begin until the entire system is analyzed.

---

# Database Audit

Analyze:

* Products table/collection
* Categories
* Collections
* Bundles
* Offers

Review all product fields:

* gender
* categorySlug
* type
* collection
* isBestseller
* isNewArrival
* offer
* bundle
* slug

Identify:

* duplicate fields
* unused fields
* conflicting fields
* inconsistent values

Examples:

Men vs men

Women vs women

Unisex vs unisex

Attar vs attar

Perfume vs perfume

Normalize all values.

---

# Backend Audit

Analyze:

* Product Schema
* Product Model
* Product Controller
* Product Services
* Product APIs
* Collection APIs
* Search APIs

Verify:

Database → API → Frontend flow

Check every filter query.

Confirm backend returns correctly filtered data.

---

# Frontend Audit

Analyze:

* Navbar
* Header
* Product Grid
* Collection Pages
* Category Pages
* Search Components
* Filter Components

Verify:

Navbar Click
→ Route
→ URL Parameter
→ API Request
→ API Response
→ Product Rendering

Check for broken filtering logic.

---

# Admin Panel Audit

Analyze:

* Product Create Form
* Product Edit Form
* Product Save API
* Product Update API

Verify:

Stored values exactly match filtering values.

Examples:

gender:

* Men
* Women
* Unisex

categorySlug:

* men
* women
* unisex

Determine whether both are required.

Choose one source of truth.

---

# Technical Requirements

## Single Source of Truth

The system must use one field for gender filtering.

Determine whether:

* gender
  OR
* categorySlug

should be the authoritative field.

Remove duplicate logic.

All filtering must depend on one consistent field.

---

## Consistent Product Types

Allowed values:

* Attar
* Perfume

All filters must use identical values.

---

## Bestseller Logic

Only products with:

isBestseller = true

must appear in Bestsellers.

---

## New Arrival Logic

Only products with:

isNewArrival = true

must appear in New Arrival.

---

## Collection Logic

Collection pages must only display products belonging to their collection.

No fallback behavior should return all products.

---

# Performance Requirements

Review:

* API efficiency
* Database queries
* Missing indexes
* Duplicate filtering
* Client-side filtering
* Server-side filtering

Recommend improvements where necessary.

---

# Deliverables

The implementation must provide:

## Analysis Report

* Architecture summary
* Data flow summary
* Root cause analysis

## Database Fixes

* Data cleanup
* Normalization scripts
* Migration scripts

## Backend Fixes

* Correct filtering queries
* API improvements

## Frontend Fixes

* Navbar fixes
* Collection page fixes
* Product listing fixes

## Admin Panel Fixes

* Correct field handling
* Validation improvements

---

# Acceptance Criteria

✅ Men page shows only Men products

✅ Women page shows only Women products

✅ Unisex page shows only Unisex products

✅ Bestsellers shows only bestseller products

✅ New Arrival shows only new arrival products

✅ Attar Collection shows only attar products

✅ Perfumes Collection shows only perfume products

✅ Bundles / Offers shows only bundle or offer products

✅ Navbar filters work correctly

✅ Backend filters work correctly

✅ Frontend filters work correctly

✅ Admin panel saves correct values

✅ Database values are normalized

✅ No duplicate products appear in incorrect collections

✅ Filtering system uses a single source of truth

✅ Production-ready scalable architecture implemented

---

# Important Rule

Analyze the entire application first.

Do not modify code until root causes have been identified and documented.

Every fix must be based on verified evidence from the codebase, database, and API responses.
