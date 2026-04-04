/**
 * Demo health readings seed data.
 *
 * These readings are linked to userId = 1 (the first registered user / owner).
 * They are inserted on server startup if they don't already exist.
 * Safe to run multiple times — duplicate inserts are silently ignored.
 *
 * To disable demo data: remove the seedHealthReadings call in server/_core/index.ts
 */

import { InsertHealthReading } from "../drizzle/schema";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

export const SEED_HEALTH_READINGS: InsertHealthReading[] = [
  // 30 days ago — baseline reading
  {
    userId: 1,
    kioskId: "kiosk-001",
    bloodPressureSystolic: 135,
    bloodPressureDiastolic: 88,
    heartRate: 82,
    weight: "85.0",
    height: "175.0",
    bmi: "27.8",
    temperature: "36.8",
    notes: "Felt a bit tired",
    recordedAt: daysAgo(30),
  },
  // 25 days ago
  {
    userId: 1,
    kioskId: "kiosk-002",
    bloodPressureSystolic: 132,
    bloodPressureDiastolic: 86,
    heartRate: 79,
    weight: "84.5",
    height: "175.0",
    bmi: "27.6",
    temperature: "36.7",
    notes: null,
    recordedAt: daysAgo(25),
  },
  // 20 days ago
  {
    userId: 1,
    kioskId: "kiosk-001",
    bloodPressureSystolic: 128,
    bloodPressureDiastolic: 84,
    heartRate: 76,
    weight: "84.0",
    height: "175.0",
    bmi: "27.4",
    temperature: "36.6",
    notes: "Started walking daily",
    recordedAt: daysAgo(20),
  },
  // 15 days ago
  {
    userId: 1,
    kioskId: "kiosk-003",
    bloodPressureSystolic: 125,
    bloodPressureDiastolic: 82,
    heartRate: 74,
    weight: "83.5",
    height: "175.0",
    bmi: "27.3",
    temperature: "36.6",
    notes: null,
    recordedAt: daysAgo(15),
  },
  // 10 days ago
  {
    userId: 1,
    kioskId: "kiosk-002",
    bloodPressureSystolic: 122,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    weight: "83.0",
    height: "175.0",
    bmi: "27.1",
    temperature: "36.5",
    notes: "Feeling better",
    recordedAt: daysAgo(10),
  },
  // 5 days ago
  {
    userId: 1,
    kioskId: "kiosk-001",
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 79,
    heartRate: 70,
    weight: "82.5",
    height: "175.0",
    bmi: "26.9",
    temperature: "36.5",
    notes: null,
    recordedAt: daysAgo(5),
  },
  // Today
  {
    userId: 1,
    kioskId: "kiosk-005",
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 77,
    heartRate: 68,
    weight: "82.0",
    height: "175.0",
    bmi: "26.8",
    temperature: "36.4",
    notes: "Great progress this month!",
    recordedAt: daysAgo(0),
  },
];
