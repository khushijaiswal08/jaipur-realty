import type { AmenityCategory } from "../../generated/prisma/enums";

// SPEC §35.3. `icon` is a lucide-react icon name (rendered via components/shared/amenity-icon.tsx).
export const AMENITIES: Array<{ name: string; slug: string; icon: string; category: AmenityCategory }> = [
  { name: "Lift", slug: "lift", icon: "arrow-up-down", category: "BASIC" },
  { name: "Power Backup", slug: "power-backup", icon: "zap", category: "BASIC" },
  { name: "24×7 Water Supply", slug: "water-supply", icon: "droplets", category: "BASIC" },
  { name: "Piped Gas", slug: "piped-gas", icon: "flame", category: "BASIC" },
  { name: "Covered Parking", slug: "covered-parking", icon: "car", category: "BASIC" },
  { name: "Visitor Parking", slug: "visitor-parking", icon: "square-parking", category: "BASIC" },
  { name: "24×7 Security", slug: "security", icon: "shield-check", category: "SECURITY" },
  { name: "CCTV Surveillance", slug: "cctv", icon: "cctv", category: "SECURITY" },
  { name: "Gated Community", slug: "gated-community", icon: "door-closed", category: "SECURITY" },
  { name: "Intercom", slug: "intercom", icon: "phone-call", category: "SECURITY" },
  { name: "Fire Safety", slug: "fire-safety", icon: "fire-extinguisher", category: "SECURITY" },
  { name: "Swimming Pool", slug: "swimming-pool", icon: "waves", category: "RECREATION" },
  { name: "Clubhouse", slug: "clubhouse", icon: "building-2", category: "RECREATION" },
  { name: "Children's Play Area", slug: "play-area", icon: "baby", category: "RECREATION" },
  { name: "Indoor Games", slug: "indoor-games", icon: "dices", category: "RECREATION" },
  { name: "Community Hall", slug: "community-hall", icon: "users", category: "RECREATION" },
  { name: "Gymnasium", slug: "gym", icon: "dumbbell", category: "HEALTH_FITNESS" },
  { name: "Jogging Track", slug: "jogging-track", icon: "footprints", category: "HEALTH_FITNESS" },
  { name: "Landscaped Garden", slug: "garden", icon: "trees", category: "ENVIRONMENT" },
  { name: "Rainwater Harvesting", slug: "rainwater-harvesting", icon: "cloud-rain", category: "ENVIRONMENT" },
  { name: "Solar Power", slug: "solar-power", icon: "sun", category: "ENVIRONMENT" },
  { name: "Vaastu Compliant", slug: "vaastu", icon: "compass", category: "CONVENIENCE" },
  { name: "Temple", slug: "temple", icon: "landmark", category: "CONVENIENCE" },
];
