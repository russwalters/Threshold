import { HandbookContent } from "@/components/handbook/handbook-content";
import type { HandbookContentProps } from "@/components/handbook/handbook-content";

// Room IDs for cross-referencing appliances to rooms
const ROOM_IDS = {
  livingRoom: "demo-room-living",
  kitchen: "demo-room-kitchen",
  masterBedroom: "demo-room-master-bed",
  masterBathroom: "demo-room-master-bath",
  guestBedroom: "demo-room-guest-bed",
  guestBathroom: "demo-room-guest-bath",
  garage: "demo-room-garage",
  laundryRoom: "demo-room-laundry",
} as const;

const demoProperty: HandbookContentProps["property"] = {
  name: "2576 Frisco Drive",
  address_line1: "2576 Frisco Dr",
  address_line2: null,
  city: "Clearwater",
  state: "FL",
  zip: "33761",
  photo_url: null,
  beds: 3,
  baths: 2,
  sqft: 1850,
};

const demoRooms: HandbookContentProps["rooms"] = [
  {
    id: ROOM_IDS.livingRoom,
    name: "Living Room",
    type: "living_room",
    photo_url: null,
    paint_colors: [
      { name: "Agreeable Gray (SW 7029) — Walls", hex: "#D0CBC5" },
      { name: "Extra White (SW 7006) — Trim & Ceiling", hex: "#F1EFEA" },
    ],
    fixtures: [
      "Hunter 52\" Dempsey ceiling fan",
      "2x recessed lights",
    ],
    features: [
      "Crown molding",
      "LVP flooring",
      "USB outlets on south wall",
    ],
    light_bulbs: [
      { location: "Ceiling fan", type: "LED A19, 60W equivalent, 2700K warm white", base: "E26" },
      { location: "Recessed lights", type: "LED A19, 60W equivalent, 2700K warm white", base: "E26" },
    ],
    notes: "Ceiling fan remote is in the top drawer of the TV console.",
  },
  {
    id: ROOM_IDS.kitchen,
    name: "Kitchen",
    type: "kitchen",
    photo_url: null,
    paint_colors: [
      { name: "Pure White (SW 7005) — Walls", hex: "#F0EDE7" },
    ],
    fixtures: [
      "Under-cabinet LED strip lights",
      "Pendant light over island (3x Edison bulbs)",
    ],
    features: [
      "Granite countertops",
      "Soft-close cabinets",
      "Pantry with pull-out shelves",
      "Garbage disposal (InSinkErator Badger 5)",
    ],
    light_bulbs: [
      { location: "Under-cabinet", type: "Integrated LED strip (replace whole unit)", base: "N/A" },
      { location: "Island pendants", type: "ST19 Edison, 40W, 2200K amber", base: "E26" },
    ],
    notes: "Garbage disposal reset button is on the bottom of the unit. Use Allen wrench from junk drawer to unjam.",
  },
  {
    id: ROOM_IDS.masterBedroom,
    name: "Master Bedroom",
    type: "bedroom",
    photo_url: null,
    paint_colors: [
      { name: "Sea Salt (SW 6204) — Walls", hex: "#C3CDC6" },
      { name: "Extra White (SW 7006) — Trim", hex: "#F1EFEA" },
    ],
    fixtures: [
      "Hampton Bay 52\" ceiling fan",
      "Walk-in closet wire shelving",
    ],
    features: [
      "Walk-in closet",
      "Double windows with blackout blinds",
      "USB outlets both sides of bed",
    ],
    light_bulbs: [
      { location: "Ceiling fan", type: "LED A19, 60W, 2700K", base: "E26" },
    ],
    notes: "Blackout blinds are cordless \u2014 push up from bottom to open.",
  },
  {
    id: ROOM_IDS.masterBathroom,
    name: "Master Bathroom",
    type: "bathroom",
    photo_url: null,
    paint_colors: [
      { name: "Repose Gray (SW 7015) — Walls", hex: "#C2BFB8" },
    ],
    fixtures: [
      "Double vanity",
      "Frameless glass shower",
      "Broan 80 CFM exhaust fan",
    ],
    features: [
      "Tile flooring",
      "Rain showerhead + handheld combo",
      "Towel warmer",
    ],
    light_bulbs: [
      { location: "Vanity", type: "LED globe G25, 40W, 3000K (6 bulbs total)", base: "E26" },
    ],
    notes: "Exhaust fan is on a 15-minute timer \u2014 press once to start. Towel warmer switch is behind the door.",
  },
  {
    id: ROOM_IDS.guestBedroom,
    name: "Guest Bedroom",
    type: "bedroom",
    photo_url: null,
    paint_colors: [
      { name: "Accessible Beige (SW 7036) — Walls", hex: "#D1C4AD" },
    ],
    fixtures: [
      "Flush mount ceiling light",
      "Closet wire shelving",
    ],
    features: [
      "Standard closet",
      "Carpet flooring",
    ],
    light_bulbs: [
      { location: "Ceiling", type: "LED A19, 60W, 2700K", base: "E26" },
    ],
    notes: "Window AC unit remote is in the nightstand drawer.",
  },
  {
    id: ROOM_IDS.guestBathroom,
    name: "Guest Bathroom",
    type: "bathroom",
    photo_url: null,
    paint_colors: [
      { name: "Alabaster (SW 7008) — Walls", hex: "#F0EBE0" },
    ],
    fixtures: [
      "Single vanity",
      "Tub/shower combo",
      "Exhaust fan",
    ],
    features: [
      "Tile flooring",
      "Medicine cabinet with mirror",
    ],
    light_bulbs: [
      { location: "Vanity bar", type: "Integrated LED (non-replaceable)", base: "N/A" },
    ],
    notes: "Hot water takes about 30 seconds to reach this bathroom.",
  },
  {
    id: ROOM_IDS.garage,
    name: "Garage",
    type: "garage",
    photo_url: null,
    paint_colors: [
      { name: "Unpainted drywall (upper)", hex: "#D5D0C8" },
      { name: "Epoxy floor coating (gray)", hex: "#8C8C8C" },
    ],
    fixtures: [
      "2x 4ft LED shop lights",
      "Chamberlain B6765 garage door opener",
    ],
    features: [
      "Workbench",
      "Wall-mounted pegboard",
      "2-car garage",
      "EV charger outlet (NEMA 14-50)",
    ],
    light_bulbs: [
      { location: "Shop lights", type: "4ft LED tube T8, direct wire (no ballast)", base: "N/A" },
    ],
    notes: "Garage door keypad code is set by tenant. Manual release is the red rope hanging from the rail.",
  },
  {
    id: ROOM_IDS.laundryRoom,
    name: "Laundry Room",
    type: "laundry",
    photo_url: null,
    paint_colors: [
      { name: "Pure White (SW 7005) — Walls", hex: "#F0EDE7" },
    ],
    fixtures: [
      "Overhead fluorescent (being replaced)",
      "Utility sink",
    ],
    features: [
      "Washer/dryer hookups",
      "Utility sink",
      "Storage shelf above",
    ],
    light_bulbs: [
      { location: "Overhead", type: "4ft fluorescent T8 (or LED T8 replacement)", base: "N/A" },
    ],
    notes: "Dryer vent should be cleaned annually. Water shutoff valves for washer are behind the unit.",
  },
];

const demoAppliances: HandbookContentProps["appliances"] = [
  {
    id: "demo-app-hvac",
    name: "HVAC System",
    brand: "Trane",
    model: "XR15 (4TWR5036E1000AA)",
    location: "Garage",
    room_id: ROOM_IDS.garage,
    status: "good",
    operating_tips: [
      "Change filter every 90 days (20x25x1)",
      "Set to Auto, not On",
      "Don't set below 72\u00b0F to prevent freezing",
    ],
  },
  {
    id: "demo-app-waterheater",
    name: "Water Heater",
    brand: "Rheem",
    model: "ProTerra 50-gal Hybrid (XE50T10HD50U1)",
    location: "Garage",
    room_id: ROOM_IDS.garage,
    status: "good",
    operating_tips: [
      "Set to 120\u00b0F",
      "Vacation mode when away >3 days",
    ],
  },
  {
    id: "demo-app-fridge",
    name: "Refrigerator",
    brand: "Samsung",
    model: "Family Hub (RF28R7551SR)",
    location: "Kitchen",
    room_id: ROOM_IDS.kitchen,
    status: "good",
    operating_tips: [
      "Water filter: Samsung DA29-00020B, replace every 6 months",
      "Ice maker shutoff is inside freezer, top left",
    ],
  },
  {
    id: "demo-app-dishwasher",
    name: "Dishwasher",
    brand: "Bosch",
    model: "300 Series (SHSM63W55N)",
    location: "Kitchen",
    room_id: ROOM_IDS.kitchen,
    status: "good",
    operating_tips: [
      "Use pods, not liquid soap",
      "Clean filter monthly (bottom of tub)",
      "Run hot water at sink before starting",
    ],
  },
  {
    id: "demo-app-washer",
    name: "Washer",
    brand: "LG",
    model: "WM4000HWA (Front Load)",
    location: "Laundry Room",
    room_id: ROOM_IDS.laundryRoom,
    status: "good",
    operating_tips: [
      "Leave door open after use to prevent mildew",
      "Clean gasket monthly",
      "Use HE detergent only",
    ],
  },
  {
    id: "demo-app-dryer",
    name: "Dryer",
    brand: "LG",
    model: "DLEX4000W (Electric)",
    location: "Laundry Room",
    room_id: ROOM_IDS.laundryRoom,
    status: "good",
    operating_tips: [
      "Clean lint trap every load",
      "Clean vent annually",
    ],
  },
  {
    id: "demo-app-range",
    name: "Oven/Range",
    brand: "GE Profile",
    model: "PGS930 (Gas)",
    location: "Kitchen",
    room_id: ROOM_IDS.kitchen,
    status: "good",
    operating_tips: [
      "Gas shutoff valve behind unit",
      "Self-clean cycle takes 3 hours",
    ],
  },
  {
    id: "demo-app-microwave",
    name: "Microwave",
    brand: "GE Profile",
    model: "PVM9005 (Over-the-Range)",
    location: "Kitchen",
    room_id: ROOM_IDS.kitchen,
    status: "good",
    operating_tips: [
      "Charcoal filter replacement every 6 months",
      "Vent switch: High for stovetop cooking",
    ],
  },
  {
    id: "demo-app-disposal",
    name: "Garbage Disposal",
    brand: "InSinkErator",
    model: "Badger 5",
    location: "Kitchen",
    room_id: ROOM_IDS.kitchen,
    status: "good",
    operating_tips: [
      "Never put grease, rice, or pasta down disposal",
      "Run cold water while using",
    ],
  },
  {
    id: "demo-app-garagedoor",
    name: "Garage Door Opener",
    brand: "Chamberlain",
    model: "B6765",
    location: "Garage",
    room_id: ROOM_IDS.garage,
    status: "good",
    operating_tips: [
      "MyQ app compatible",
      "Battery backup lasts ~50 cycles",
    ],
  },
  {
    id: "demo-app-smoke",
    name: "Smoke Detectors (x5)",
    brand: "First Alert",
    model: "SA320CN",
    location: "Various \u2014 hallways, bedrooms, kitchen",
    room_id: null,
    status: "good",
    operating_tips: [
      "Test monthly",
      "Replace batteries annually (9V)",
      "Replace entire unit every 10 years",
    ],
  },
  {
    id: "demo-app-thermostat",
    name: "Thermostat",
    brand: "Nest",
    model: "Learning Thermostat (3rd Gen)",
    location: "Living room hallway",
    room_id: ROOM_IDS.livingRoom,
    status: "good",
    operating_tips: [
      "WiFi: configured by tenant",
      "Eco mode: 62\u00b0F heat / 78\u00b0F cool",
    ],
  },
  {
    id: "demo-app-fans",
    name: "Ceiling Fans",
    brand: "Hunter / Hampton Bay",
    model: "Dempsey 52\" + Hampton Bay 52\"",
    location: "Living Room + Master Bedroom",
    room_id: null,
    status: "good",
    operating_tips: [
      "Summer: counterclockwise (cool)",
      "Winter: clockwise (push warm air down)",
    ],
  },
  {
    id: "demo-app-softener",
    name: "Water Softener",
    brand: "Fleck",
    model: "5600SXT",
    location: "Garage",
    room_id: ROOM_IDS.garage,
    status: "good",
    operating_tips: [
      "Add salt when tank is less than 1/3 full",
      "Use solar salt crystals, not pellets",
    ],
  },
  {
    id: "demo-app-pool",
    name: "Pool Pump",
    brand: "Hayward",
    model: "Super Pump VS (SP2610X15VS)",
    location: "Backyard equipment pad",
    room_id: null,
    status: "good",
    operating_tips: [
      "Runs 8 hours daily on timer",
      "Clean skimmer basket weekly",
      "Backwash filter monthly",
    ],
  },
];

const demoEmergencyInfo: HandbookContentProps["emergencyInfo"] = {
  water_shutoff: {
    location: "Front of house, near sidewalk. Requires meter key.",
    description: "Main water shutoff",
  },
  electric_shutoff: {
    location: "East side of garage, gray panel box. Main breaker is top center, 200A.",
    description: "Main electrical panel",
  },
  gas_shutoff: {
    location: "West side of house near AC unit. Requires wrench to turn.",
    description: "Main gas shutoff",
  },
  fire_extinguishers: [
    { location: "Kitchen \u2014 under sink", type: "ABC rated" },
    { location: "Garage \u2014 wall mount by door", type: "ABC rated" },
  ],
  emergency_contacts: [
    { name: "Russ Walters", role: "Property Owner", phone: "(904) 555-0142", available: "Call/text anytime" },
    { name: "Beachside Property Management", role: "Property Manager", phone: "(727) 555-0198", available: "Mon-Fri 8am-6pm" },
    { name: "Dave's Plumbing", role: "Plumber", phone: "(727) 555-0234", available: "24/7 emergency" },
    { name: "Clearwater Electric", role: "Electrician", phone: "(727) 555-0367", available: "Mon-Sat 7am-7pm" },
    { name: "Cool Breeze HVAC", role: "HVAC", phone: "(727) 555-0445", available: "24/7 emergency" },
  ],
  emergency_procedures: [
    {
      title: "Water Leak",
      icon: "droplets",
      steps: [
        "Turn off water at main shutoff (front of house)",
        "Turn off water heater",
        "Call Dave's Plumbing: (727) 555-0234",
        "Move belongings away from water",
        "Take photos for documentation",
        "Notify property manager",
      ],
    },
    {
      title: "Power Outage",
      icon: "zap",
      steps: [
        "Check if neighbors also lost power (storm vs. breaker)",
        "Check breaker panel in garage",
        "If breaker tripped: flip fully OFF then ON",
        "If area-wide outage: call Duke Energy (800) 228-8485",
        "Unplug sensitive electronics",
        "Generator hookup is on east exterior wall",
      ],
    },
    {
      title: "Gas Smell",
      icon: "flame",
      steps: [
        "Do NOT flip any switches or create sparks",
        "Open windows immediately",
        "Leave the house",
        "Call 911 from outside",
        "Call gas company: TECO (813) 228-4111",
        "Do not re-enter until cleared by fire dept",
      ],
    },
    {
      title: "AC Not Working",
      icon: "zap",
      steps: [
        "Check thermostat batteries and settings",
        "Check air filter \u2014 replace if dirty",
        "Check breaker panel \u2014 AC is breaker #18/20 (double)",
        "Check if ice formed on outdoor unit \u2014 turn off for 2 hours",
        "If still not working: call Cool Breeze HVAC (727) 555-0445",
      ],
    },
    {
      title: "Hurricane Preparation",
      icon: "cloud-rain",
      steps: [
        "Bring in all patio furniture and loose items",
        "Close and lock all windows",
        "Fill bathtubs with water for flushing toilets",
        "Charge all devices",
        "Locate flashlights (kitchen junk drawer + master closet)",
        "Pool pump should be turned OFF",
        "Do NOT tape windows \u2014 it doesn't help",
        "Evacuation zone: B \u2014 monitor Pinellas County emergency management",
      ],
    },
  ],
};

const demoHandbookConfig: HandbookContentProps["handbookConfig"] = {
  welcome_message:
    "Welcome to 2576 Frisco Drive! We're glad you're here. This handbook has everything you need to feel at home. If you ever need anything, don't hesitate to reach out.",
  wifi: {
    network: "Frisco2576_5G",
    password: "SunnyBeach2024!",
  },
  parking:
    "2-car garage + driveway fits 2 additional vehicles. Street parking available on Frisco Dr (no overnight restrictions). Please keep garage door closed when not in use.",
  trash:
    "Trash collection: Tuesday & Friday mornings. Recycling: Thursday morning. Bins go curbside by 7am. Large item pickup: schedule at pinellascounty.org or call (727) 464-7500. Bins stored on left side of garage.",
  house_rules: [
    "No smoking inside the house or garage",
    "Pets allowed with prior approval and pet deposit",
    "Quiet hours: 10pm - 8am",
    "Pool maintenance is included \u2014 please don't adjust chemical levels",
    "Report any maintenance issues within 24 hours",
    "Change HVAC filter every 90 days (provided in garage)",
    "No modifications to the property without written approval",
    "Keep gutters clear of debris after storms",
  ],
  local_recommendations: [
    { name: "Frenchy's Rockaway Grill", category: "Restaurant", description: "Best grouper sandwich on the beach. Cash only. Sunset views.", distance: "1.8 mi" },
    { name: "Clear Sky Cafe", category: "Restaurant", description: "Great brunch spot. Try the crab cake benedict.", distance: "1.2 mi" },
    { name: "Bob Heilman's Beachcomber", category: "Restaurant", description: "Upscale dinner. Fried chicken is legendary.", distance: "1.6 mi" },
    { name: "Publix", category: "Grocery", description: "0.8 miles on Gulf-to-Bay. Subs are elite.", distance: "0.8 mi" },
    { name: "Trader Joe's", category: "Grocery", description: "2.3 miles on US-19.", distance: "2.3 mi" },
    { name: "Clearwater Beach", category: "Beach", description: "#1 beach in the US (again). Free street parking on weekdays before 9am.", distance: "1.5 mi" },
    { name: "Sand Key Park", category: "Beach", description: "Less crowded than Clearwater. Great for families. $5 parking.", distance: "2.8 mi" },
    { name: "Clearwater Marine Aquarium", category: "Park", description: "Home of Winter the dolphin. Kids love it. Book online to skip the line.", distance: "1.9 mi" },
    { name: "Dunedin Causeway", category: "Park", description: "Kayak and paddleboard rentals. Amazing sunsets. 15 min drive.", distance: "6.2 mi" },
    { name: "BayCare Urgent Care", category: "Urgent Care", description: "1.2 miles on Gulf-to-Bay. Open 7 days.", distance: "1.2 mi" },
    { name: "CVS (24-hour Pharmacy)", category: "Grocery", description: "0.5 miles on Gulf-to-Bay. 24-hour pharmacy.", distance: "0.5 mi" },
  ],
  utility_info: [
    { type: "Electric", provider: "Duke Energy", accountNote: "duke-energy.com or (800) 228-8485. Average bill: $150-220/month. Budget billing available.", phone: "(800) 228-8485" },
    { type: "Water / Sewer", provider: "Clearwater Utilities", accountNote: "myclearwater.com or (727) 562-4600. Average bill: $60-80/month. Irrigation is separate meter.", phone: "(727) 562-4600" },
    { type: "Gas", provider: "TECO Peoples Gas", accountNote: "peoplesgas.com or (877) 832-6747. Serves range, water heater, and dryer. Average: $30-50/month.", phone: "(877) 832-6747" },
    { type: "Internet", provider: "Spectrum (recommended)", accountNote: "spectrum.com or (855) 707-7328. 400mbps plan works great. Frontier fiber available as alternative.", phone: "(855) 707-7328" },
    { type: "Trash / Recycling", provider: "Pinellas County", accountNote: "Included in rent \u2014 no setup needed. See trash schedule above.", phone: "(727) 464-7500" },
  ],
  share_id: "demo",
};

export default function DemoHandbookPage() {
  const handbookUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || "https://threshold.app") +
    "/handbook/demo";

  return (
    <HandbookContent
      property={demoProperty}
      rooms={demoRooms}
      appliances={demoAppliances}
      emergencyInfo={demoEmergencyInfo}
      handbookConfig={demoHandbookConfig}
      handbookUrl={handbookUrl}
    />
  );
}
