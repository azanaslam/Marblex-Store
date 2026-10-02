const ClientReview = require("../models/ClientReview");

const initialReviews = [
  {
    name: "Engr. Salman Qureshi",
    role: "Chief Structural Consultant",
    company: "Apex Infrastructure Ltd.",
    quote:
      "MARBLEX elastomeric membranes eliminated severe basement seepage in our 24-story commercial tower. Zero moisture detected even after monsoon testing.",
    rating: 5,
    status: "approved",
    featured: true,
    source: "seed",
  },
  {
    name: "Tariq Mehmood",
    role: "Project Director",
    company: "National Hydel Works",
    quote:
      "Their vulcanized rubber waterstops and technical support during concrete pouring at the irrigation canal project were flawless. 100% recommended.",
    rating: 5,
    status: "approved",
    featured: true,
    source: "seed",
  },
  {
    name: "Dr. Hamza Javed",
    role: "Facilities Operations Lead",
    company: "Pharmatech Bio-Labs",
    quote:
      "Top quality epoxy flooring with exceptional chemical resistance. Our pharmaceutical manufacturing plant passed all international sterile audits.",
    rating: 5,
    status: "approved",
    featured: true,
    source: "seed",
  },
  {
    name: "Engr. Nadia Khan",
    role: "Site Engineer",
    company: "Skyline Developers",
    quote:
      "Heat-reflective roof coating cut our rooftop surface temperature noticeably. Application crew guidance from MARBLEX was precise and on schedule.",
    rating: 5,
    status: "approved",
    featured: false,
    source: "seed",
  },
  {
    name: "Imran Shah",
    role: "Procurement Head",
    company: "Gulf Build Consortium",
    quote:
      "Consistent batch quality across multiple consignments. Documentation, TDS packs, and delivery timelines met every milestone on our Karachi warehouse job.",
    rating: 5,
    status: "approved",
    featured: false,
    source: "seed",
  },
  {
    name: "Engr. Bilal Ahmed",
    role: "QA / QC Manager",
    company: "Metro Civil Works",
    quote:
      "Adhesion and crack-bridging performance on podium decks exceeded our internal checklist. We now specify MARBLEX as the default waterproofing system.",
    rating: 5,
    status: "approved",
    featured: false,
    source: "seed",
  },
  {
    name: "Sana Rauf",
    role: "Architect / Spec Writer",
    company: "Studio North Architecture",
    quote:
      "Specification support was excellent — clear system build-ups for wet areas and terraces. Clients appreciated the clean finish and warranty clarity.",
    rating: 4,
    status: "approved",
    featured: false,
    source: "seed",
  },
  {
    name: "Capt. Asif Raza",
    role: "Plant Manager",
    company: "Indus Packaging Mills",
    quote:
      "Chemical-resistant flooring in our process hall stood up to solvents and heavy forklift traffic. Downtime stayed minimal during the install window.",
    rating: 5,
    status: "approved",
    featured: false,
    source: "seed",
  },
  {
    name: "Engr. Farooq Siddiqui",
    role: "Infrastructure Lead",
    company: "Lahore Urban Projects",
    quote:
      "Joint sealing and waterstop detailing on retaining walls performed under hydrostatic pressure. Post-rain inspections stayed dry across all monitored zones.",
    rating: 5,
    status: "approved",
    featured: false,
    source: "seed",
  },
  {
    name: "Maria Joseph",
    role: "Operations Director",
    company: "Coastal Hospitality Group",
    quote:
      "From primer to topcoat, the waterproofing package for our beachfront property was executed cleanly. No blistering after the first monsoon season.",
    rating: 5,
    status: "approved",
    featured: false,
    source: "seed",
  },
];

const seedClientReviews = async () => {
  try {
    const count = await ClientReview.countDocuments();
    if (count === 0) {
      await ClientReview.insertMany(initialReviews);
      console.log(`Successfully seeded ${initialReviews.length} client reviews to Database`);
      return;
    }

    // Top-up missing seed reviews by name if DB already has a partial set
    for (const review of initialReviews) {
      const exists = await ClientReview.findOne({ name: review.name, company: review.company });
      if (!exists) {
        await ClientReview.create(review);
      }
    }
  } catch (error) {
    console.error("Client review seeding failed:", error.message);
  }
};

module.exports = { seedClientReviews, initialReviews };
