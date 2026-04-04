export interface Kiosk {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  services: string[];
  image: string;
  phone: string;
  email: string;
  distance?: number;
  rating?: number;
}

export const JEDDAH_KIOSKS: Kiosk[] = [
  {
    id: "kiosk-001",
    name: "Red Sea Mall Health Station",
    location: "Red Sea Mall",
    address: "King Abdulaziz Road, Red Sea Mall, Jeddah",
    latitude: 21.5433,
    longitude: 39.1726,
    hours: [
      { day: "Saturday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Sunday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Monday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Tuesday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Wednesday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Thursday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Friday", open: "12:00 PM", close: "11:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Health Risk Assessment"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/hero-health-kiosk-5mwyXD2eAKfFKPmEnVJdix.webp",
    phone: "+966 12 645 8888",
    email: "redsea@higisaudi.com",
    rating: 4.8,
  },
  {
    id: "kiosk-002",
    name: "Jeddah Corniche Wellness Center",
    location: "Jeddah Corniche",
    address: "Corniche Road, Near Al Noor Mosque, Jeddah",
    latitude: 21.5239,
    longitude: 39.1714,
    hours: [
      { day: "Saturday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Sunday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Monday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Tuesday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Wednesday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Thursday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Friday", open: "10:00 AM", close: "10:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Diabetes Risk Screening"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/health-metrics-visual-M3LugxJgaMsdLyecxjVXzc.webp",
    phone: "+966 12 652 3333",
    email: "corniche@higisaudi.com",
    rating: 4.9,
  },
  {
    id: "kiosk-003",
    name: "Tahlia Street Medical Hub",
    location: "Tahlia Street",
    address: "Tahlia Street, Downtown Jeddah",
    latitude: 21.5436,
    longitude: 39.1572,
    hours: [
      { day: "Saturday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Sunday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Monday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Tuesday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Wednesday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Thursday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Friday", open: "11:00 AM", close: "09:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Cardiovascular Risk Assessment"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/hero-health-kiosk-5mwyXD2eAKfFKPmEnVJdix.webp",
    phone: "+966 12 667 5555",
    email: "tahlia@higisaudi.com",
    rating: 4.7,
  },
  {
    id: "kiosk-004",
    name: "Balad Historic District Health Point",
    location: "Al Balad",
    address: "Souq Al Alawi, Al Balad, Jeddah",
    latitude: 21.4834,
    longitude: 39.1859,
    hours: [
      { day: "Saturday", open: "08:00 AM", close: "08:00 PM" },
      { day: "Sunday", open: "08:00 AM", close: "08:00 PM" },
      { day: "Monday", open: "08:00 AM", close: "08:00 PM" },
      { day: "Tuesday", open: "08:00 AM", close: "08:00 PM" },
      { day: "Wednesday", open: "08:00 AM", close: "08:00 PM" },
      { day: "Thursday", open: "08:00 AM", close: "08:00 PM" },
      { day: "Friday", open: "10:00 AM", close: "08:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Wellness Assessment"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/health-metrics-visual-M3LugxJgaMsdLyecxjVXzc.webp",
    phone: "+966 12 642 1111",
    email: "balad@higisaudi.com",
    rating: 4.6,
  },
  {
    id: "kiosk-005",
    name: "North Jeddah Medical Center",
    location: "North Jeddah",
    address: "Prince Sultan Road, North Jeddah",
    latitude: 21.6289,
    longitude: 39.1234,
    hours: [
      { day: "Saturday", open: "09:00 AM", close: "10:00 PM" },
      { day: "Sunday", open: "09:00 AM", close: "10:00 PM" },
      { day: "Monday", open: "09:00 AM", close: "10:00 PM" },
      { day: "Tuesday", open: "09:00 AM", close: "10:00 PM" },
      { day: "Wednesday", open: "09:00 AM", close: "10:00 PM" },
      { day: "Thursday", open: "09:00 AM", close: "10:00 PM" },
      { day: "Friday", open: "12:00 PM", close: "10:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Health Risk Assessment"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/hero-health-kiosk-5mwyXD2eAKfFKPmEnVJdix.webp",
    phone: "+966 12 698 7777",
    email: "north@higisaudi.com",
    rating: 4.8,
  },
  {
    id: "kiosk-006",
    name: "South Jeddah Wellness Kiosk",
    location: "South Jeddah",
    address: "Madina Road, South Jeddah",
    latitude: 21.4234,
    longitude: 39.1456,
    hours: [
      { day: "Saturday", open: "10:00 AM", close: "09:00 PM" },
      { day: "Sunday", open: "10:00 AM", close: "09:00 PM" },
      { day: "Monday", open: "10:00 AM", close: "09:00 PM" },
      { day: "Tuesday", open: "10:00 AM", close: "09:00 PM" },
      { day: "Wednesday", open: "10:00 AM", close: "09:00 PM" },
      { day: "Thursday", open: "10:00 AM", close: "09:00 PM" },
      { day: "Friday", open: "12:00 PM", close: "09:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Diabetes Screening"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/health-metrics-visual-M3LugxJgaMsdLyecxjVXzc.webp",
    phone: "+966 12 634 2222",
    email: "south@higisaudi.com",
    rating: 4.5,
  },
  {
    id: "kiosk-007",
    name: "Obhur Health Station",
    location: "Obhur",
    address: "Obhur Main Street, Jeddah",
    latitude: 21.7234,
    longitude: 39.0856,
    hours: [
      { day: "Saturday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Sunday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Monday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Tuesday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Wednesday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Thursday", open: "08:00 AM", close: "10:00 PM" },
      { day: "Friday", open: "10:00 AM", close: "10:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Cardiovascular Assessment"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/hero-health-kiosk-5mwyXD2eAKfFKPmEnVJdix.webp",
    phone: "+966 12 689 4444",
    email: "obhur@higisaudi.com",
    rating: 4.7,
  },
  {
    id: "kiosk-008",
    name: "Al Nuzha Pharmacy Health Hub",
    location: "Al Nuzha",
    address: "Al Nuzha District, Jeddah",
    latitude: 21.5834,
    longitude: 39.2156,
    hours: [
      { day: "Saturday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Sunday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Monday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Tuesday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Wednesday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Thursday", open: "09:00 AM", close: "09:00 PM" },
      { day: "Friday", open: "11:00 AM", close: "09:00 PM" },
    ],
    services: ["Blood Pressure", "Weight & BMI", "Heart Rate", "Temperature", "Health Risk Assessment"],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/health-metrics-visual-M3LugxJgaMsdLyecxjVXzc.webp",
    phone: "+966 12 671 6666",
    email: "nuzha@higisaudi.com",
    rating: 4.8,
  },
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
