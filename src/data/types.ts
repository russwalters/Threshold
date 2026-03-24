export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: "single_family" | "condo" | "townhouse" | "apartment";
  occupancy: "rental" | "primary" | "vacation";
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  rentAmount?: number;
  photo: string;
  completionPercent: number;
  rooms: Room[];
  appliances: Appliance[];
  documents: Document[];
  maintenanceHistory: MaintenanceEvent[];
  emergencyInfo: EmergencyInfo;
  handbook: HandbookConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  photo: string;
  paintColors: PaintColor[];
  fixtures: string[];
  features: string[];
  lightBulbs: LightBulb[];
  notes: string;
  applianceIds: string[];
}

export interface PaintColor {
  name: string;
  brand: string;
  code: string;
  hex: string;
  location: string;
}

export interface LightBulb {
  location: string;
  type: string;
  wattage: string;
  base: string;
}

export interface Appliance {
  id: string;
  propertyId: string;
  roomId: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  photo: string;
  purchaseDate: string;
  warrantyExpiry: string;
  manualUrl: string;
  serviceHistory: ServiceEvent[];
  operatingTips: string[];
  status: "good" | "needs_attention" | "replace_soon";
}

export interface ServiceEvent {
  id: string;
  date: string;
  type: "repair" | "maintenance" | "inspection" | "installation";
  description: string;
  provider: string;
  cost: number;
  notes?: string;
}

export interface Document {
  id: string;
  propertyId: string;
  name: string;
  category: "warranty" | "manual" | "receipt" | "inspection" | "insurance" | "lease" | "permit" | "other";
  fileType: string;
  uploadedAt: string;
  size: string;
}

export interface MaintenanceEvent {
  id: string;
  propertyId: string;
  date: string;
  type: "scheduled" | "completed" | "upcoming";
  category: string;
  title: string;
  description: string;
  cost?: number;
  provider?: string;
}

export interface EmergencyInfo {
  waterShutoff: string;
  electricPanel: string;
  gasShutoff: string;
  fireExtinguishers: string;
  emergencyContacts: EmergencyContact[];
  procedures: EmergencyProcedure[];
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available: string;
}

export interface EmergencyProcedure {
  title: string;
  icon: string;
  steps: string[];
}

export interface HandbookConfig {
  shareId: string;
  published: boolean;
  welcomeMessage: string;
  wifiName: string;
  wifiPassword: string;
  parkingInfo: string;
  trashSchedule: string;
  houseRules: string[];
  localRecommendations: LocalRecommendation[];
  utilityInfo: UtilityInfo[];
  moveInDate?: string;
}

export interface LocalRecommendation {
  category: string;
  name: string;
  description: string;
  distance: string;
}

export interface UtilityInfo {
  type: string;
  provider: string;
  accountNote: string;
  phone: string;
}

export interface Activity {
  id: string;
  propertyId: string;
  type: "appliance_added" | "document_uploaded" | "maintenance_completed" | "room_updated" | "handbook_published" | "property_created";
  title: string;
  description: string;
  timestamp: string;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  property: string;
}
