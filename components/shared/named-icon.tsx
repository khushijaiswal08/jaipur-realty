import {
  ArrowUpDown,
  Baby,
  Building,
  Building2,
  Car,
  Castle,
  Cctv,
  CircleCheck,
  CloudRain,
  Compass,
  Dices,
  DoorClosed,
  Droplets,
  Dumbbell,
  FileCheck,
  FireExtinguisher,
  Flame,
  Footprints,
  House,
  KeyRound,
  Landmark,
  LandPlot,
  MapPinned,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  SquareParking,
  Store,
  Sun,
  Trees,
  Users,
  Waves,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/**
 * Icons referenced by name from the database (Amenity.icon) or copy constants.
 * Explicit registry = only these icons are bundled. Unknown names fall back to a check mark.
 */
const REGISTRY: Record<string, LucideIcon> = {
  "arrow-up-down": ArrowUpDown,
  baby: Baby,
  building: Building,
  "building-2": Building2,
  car: Car,
  castle: Castle,
  cctv: Cctv,
  "cloud-rain": CloudRain,
  compass: Compass,
  dices: Dices,
  "door-closed": DoorClosed,
  droplets: Droplets,
  dumbbell: Dumbbell,
  "file-check": FileCheck,
  "fire-extinguisher": FireExtinguisher,
  flame: Flame,
  footprints: Footprints,
  house: House,
  "key-round": KeyRound,
  landmark: Landmark,
  "land-plot": LandPlot,
  "map-pinned": MapPinned,
  "message-circle": MessageCircle,
  "phone-call": PhoneCall,
  "shield-check": ShieldCheck,
  "square-parking": SquareParking,
  store: Store,
  sun: Sun,
  trees: Trees,
  users: Users,
  waves: Waves,
  zap: Zap,
};

export const KNOWN_ICON_NAMES = Object.keys(REGISTRY);

export function NamedIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = REGISTRY[name] ?? CircleCheck;
  return <Icon aria-hidden="true" {...props} />;
}
