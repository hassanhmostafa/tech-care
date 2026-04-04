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
