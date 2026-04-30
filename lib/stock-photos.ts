/**
 * Stock photo mapper — returns Pexels/Unsplash URLs for hero + gallery
 * based on prospect category and location.
 *
 * Future: replace with GPT Image 2 generation per prospect.
 * For now, curated sets per industry avoid API costs.
 */

interface PhotoSet {
  hero: string;
  intro: string;
  about: string;
  callCard: string;
  gallery: string[];
  galleryLabels: string[];
}

const PEXELS = (id: number, w = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

const PHOTO_SETS: Record<string, PhotoSet> = {
  fencing: {
    hero: PEXELS(27393535, 1400),
    intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
    about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(14776744), PEXELS(35400592), PEXELS(35182397), PEXELS(36443019),
      PEXELS(30682114), PEXELS(18900649), PEXELS(35382735), PEXELS(27393535),
    ],
    galleryLabels: [
      "Privacy Fence", "Full Yard Replacement", "Gate Installation", "Crew at Work",
      "Landscape + Fencing", "Property Line Fence", "Storm Damage Repair", "New Build",
    ],
  },
  roofing: {
    hero: PEXELS(8961065, 1400),
    intro: UNSPLASH("photo-1558618666-fcd25c85f82e", 1173),
    about: UNSPLASH("photo-1504307651254-35680f356dfd", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(8961065), PEXELS(7937404), PEXELS(5691640), PEXELS(5691622),
      PEXELS(6474471), PEXELS(8961065), PEXELS(5691640), PEXELS(7937404),
    ],
    galleryLabels: [
      "Shingle Replacement", "Full Roof Tear-Off", "Storm Damage Repair", "Flat Roof Coating",
      "Gutter Install", "Ridge Cap Detail", "Emergency Tarping", "New Construction",
    ],
  },
  painting: {
    hero: UNSPLASH("photo-1562259929-b4e1fd3aef09", 1400),
    intro: UNSPLASH("photo-1589939705384-5185137a7f0f", 1173),
    about: UNSPLASH("photo-1581578731548-c64695cc6952", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(6474471), PEXELS(5691640), PEXELS(5691622), PEXELS(7937404),
      PEXELS(8961065), PEXELS(6474471), PEXELS(5691640), PEXELS(5691622),
    ],
    galleryLabels: [
      "Interior Living Room", "Exterior Repaint", "Cabinet Refinish", "Trim & Detail",
      "Commercial Storefront", "Color Consultation", "Prep Work", "Final Coat",
    ],
  },
  plumbing: {
    hero: UNSPLASH("photo-1585704032915-c3400ca199e7", 1400),
    intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
    about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(6474471), PEXELS(5691640), PEXELS(5691622), PEXELS(7937404),
      PEXELS(8961065), PEXELS(6474471), PEXELS(5691640), PEXELS(5691622),
    ],
    galleryLabels: [
      "Pipe Repair", "Water Heater Install", "Drain Cleaning", "Fixture Upgrade",
      "Emergency Service", "Bathroom Remodel", "Kitchen Plumbing", "Sewer Line",
    ],
  },
  hvac: {
    hero: UNSPLASH("photo-1621905252507-b35492cc74b4", 1400),
    intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
    about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(6474471), PEXELS(5691640), PEXELS(5691622), PEXELS(7937404),
      PEXELS(8961065), PEXELS(6474471), PEXELS(5691640), PEXELS(5691622),
    ],
    galleryLabels: [
      "AC Unit Install", "Furnace Repair", "Duct Cleaning", "Thermostat Upgrade",
      "Emergency Repair", "System Tune-Up", "Commercial HVAC", "New Construction",
    ],
  },
  landscaping: {
    hero: UNSPLASH("photo-1558904541-efa843a96f01", 1400),
    intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
    about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(1453499), PEXELS(2119714), PEXELS(6444961), PEXELS(7937404),
      PEXELS(1453499), PEXELS(2119714), PEXELS(6444961), PEXELS(7937404),
    ],
    galleryLabels: [
      "Front Yard Design", "Patio Hardscape", "Seasonal Cleanup", "Mulch & Beds",
      "Lawn Care Program", "Tree Planting", "Irrigation Install", "Outdoor Lighting",
    ],
  },
  concrete: {
    hero: UNSPLASH("photo-1590496793907-bde9e7130cad", 1400),
    intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
    about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(6474471), PEXELS(5691640), PEXELS(5691622), PEXELS(7937404),
      PEXELS(8961065), PEXELS(6474471), PEXELS(5691640), PEXELS(5691622),
    ],
    galleryLabels: [
      "Driveway Pour", "Stamped Patio", "Sidewalk Repair", "Foundation Work",
      "Retaining Wall", "Pool Deck", "Commercial Slab", "Decorative Finish",
    ],
  },
  "general contractor": {
    hero: UNSPLASH("photo-1504307651254-35680f356dfd", 1400),
    intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
    about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
    callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
    gallery: [
      PEXELS(6474471), PEXELS(5691640), PEXELS(5691622), PEXELS(7937404),
      PEXELS(8961065), PEXELS(6474471), PEXELS(5691640), PEXELS(5691622),
    ],
    galleryLabels: [
      "Kitchen Remodel", "Bathroom Renovation", "Room Addition", "Framing",
      "Finish Carpentry", "Flooring Install", "Exterior Siding", "Deck Build",
    ],
  },
};

const DEFAULT_SET: PhotoSet = {
  hero: UNSPLASH("photo-1504307651254-35680f356dfd", 1400),
  intro: UNSPLASH("photo-1548345680-f5475ea5df84", 1173),
  about: UNSPLASH("photo-1595844730298-b960ff98fee0", 1170),
  callCard: UNSPLASH("photo-1605568985653-3d8e43f4efa6", 600),
  gallery: [
    PEXELS(6474471), PEXELS(5691640), PEXELS(5691622), PEXELS(7937404),
    PEXELS(8961065), PEXELS(6474471), PEXELS(5691640), PEXELS(5691622),
  ],
  galleryLabels: [
    "Project 1", "Project 2", "Project 3", "Project 4",
    "Project 5", "Project 6", "Project 7", "Project 8",
  ],
};

export function getPhotosForCategory(category: string): PhotoSet {
  const key = category.toLowerCase().trim();
  // Try exact match first, then partial
  if (PHOTO_SETS[key]) return PHOTO_SETS[key];
  for (const [k, v] of Object.entries(PHOTO_SETS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return DEFAULT_SET;
}
