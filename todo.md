# Tech Care TODO

## Completed
- [x] Homepage with hero section and features
- [x] Interactive map with kiosk locations in Jeddah
- [x] Station finder with search and filter
- [x] Station detail pages with hours, services, contact info
- [x] Navigation and footer components
- [x] Rebrand from Higi Saudi to Tech Care
- [x] Database-ready architecture (kiosks table, tRPC API, seed data)
- [x] Fix Google Maps duplicate script load error

## In Progress
- [x] Admin panel for kiosk CRUD management (protected /admin route)
- [x] User health history dashboard (log and view screening results)
- [x] Get Directions button integration with Google Maps navigation

## New Tasks
- [x] Fix Trend component crash (undefined values array)
- [x] Add operating hours editor to Admin kiosk form
- [x] Add services editor to Admin kiosk form
- [x] Seed test health readings for demo

## Cultural Imagery Update
- [x] Generate Saudi-appropriate hero image (men in white thobes, women in black abayas at health kiosk)
- [x] Generate Saudi-appropriate health metrics visual image
- [x] Upload images to CDN and update website references

## Image Update - Men Only
- [x] Regenerate hero image with Saudi men in white thobes only (no women)
- [x] Regenerate metrics visual with Saudi man in white thobe only
- [x] Regenerate CTA background with Saudi men in white thobes only
- [x] Upload to CDN and update website references

## BMI Comparison Feature
- [x] Add gender and birthDate fields to users table schema
- [x] Run DB migration
- [x] Add profile tRPC procedures (getProfile, updateProfile)
- [x] Build profile setup/edit page for gender and birth date
- [x] Implement actual BMI and ideal BMI calculation logic on server
- [x] Add BMI comparison UI component to health dashboard
- [x] Add test height/weight data to seed for BMI demo
- [x] Write vitest tests for BMI calculation

## New Features - Round 3
- [x] Ideal weight target with kg to lose/gain and progress bar on health dashboard
- [x] Health score summary (0-100) combining BP, HR, BMI, temperature
- [x] Arabic/English language toggle with full RTL layout support

## Chart Time Range Feature
- [x] Spread seed health readings over 12+ months for meaningful range data
- [x] Add time range filter (1W, 1M, 1Y, Max) to health readings tRPC procedure
- [x] Build range selector UI above charts (pill buttons like currency charts)
- [x] Update X-axis date format per range (e.g. "Apr 4" for week, "Mar 16" for month, "Jan" for year)
- [x] Add area fill under lines for visual polish

## Chart Improvements
- [x] Separate Heart Rate and Weight into individual charts
- [x] Add BMI trend chart
- [x] Add Health Score trend chart
- [x] Add show/hide toggle system for each chart

## Layout Adjustments
- [x] Swap Charts and BMI Comparison sections so Charts appear directly above Reading History

## AI Health & Diet Plan Feature
- [x] Create AI plan tRPC procedure that reads user health data and calls LLM
- [x] Build AI Health Plan page with plan type selector (health/diet/combined)
- [x] Display AI-generated plan with markdown rendering
- [x] Add plan history (save generated plans to DB)
- [x] Wire navigation link to AI Plan page
- [x] Write vitest tests for AI plan procedure

## Three-Tier Role System (user / kiosk_owner / admin)
- [x] Add kiosk_owner to users role enum in schema
- [x] Add ownerId (FK → users.id, nullable) to kiosks table
- [x] Run DB migration
- [x] Add ownerProcedure role guard on server (kiosk_owner or admin)
- [x] Add assignKioskOwner procedure to admin router
- [x] Add ownerUpdateKiosk procedure (only owner of that kiosk can edit)
- [x] Build Kiosk Owner dashboard page (/my-kiosks)
- [x] Update Admin panel with owner assignment UI (dropdown of users)
- [x] Restrict create/delete kiosk to admin only in UI
- [x] Update navigation: show My Kiosks link for kiosk_owner role
- [x] Write vitest tests for role guards (19 new tests, 50 total passing)

## Hours Editor Fix
- [x] Replace 24-hour time inputs with 12-hour AM/PM selectors in MyKiosks HoursEditor
- [x] Replace 24-hour time inputs with 12-hour AM/PM selectors in Admin panel HoursEditor

## Searchable User Picker for Admin Owner Assignment
- [x] Replace dropdown with searchable combobox (search by name or email)
- [x] Build UserSearchCombobox component with debounced search

## Kiosk Request Workflow (User → Admin)
- [x] Add kioskRequests table to schema (type: create/delete, status: pending/approved/rejected, payload JSON)
- [x] Run DB migration
- [x] Add submitKioskRequest procedure (any authenticated user)
- [x] Add listKioskRequests, approveRequest, rejectRequest procedures (admin only)
- [x] Build "Request a Kiosk" page/modal for users to submit create/delete requests
- [x] Add Requests tab to Admin panel with approve/reject actions
- [x] Show pending request count badge on Admin nav

## Kiosk Visit Booking System
- [x] Add bookings table to schema (userId, kioskId, date, timeSlot, status, notes)
- [x] Run DB migration
- [x] Add bookSlot, myBookings, cancelBooking procedures (user)
- [x] Add kioskBookings procedure (kiosk_owner/admin — see bookings for owned kiosks)
- [x] Build booking UI on station detail page (date picker + available time slots)
- [x] Build My Bookings section on health dashboard or separate page
- [x] Add Bookings tab to My Kiosks page for owners to see/manage upcoming visits
- [x] Write vitest tests for bookings and kioskRequests (17 new tests, 67 total passing)

## Bug Fix: Kiosk Request Approval Owner Assignment
- [x] Fix approveKioskRequest: set ownerId to requester's userId when creating kiosk from approved request
- [x] Auto-promote requester role to kiosk_owner if they are currently a plain user
