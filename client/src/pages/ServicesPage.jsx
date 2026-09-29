import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const services = [
  {
    title: "High-Performance Chemical Coatings",
    description: "Liquid-applied elastomeric and crystalline coatings designed to seal concrete structures against water ingress, chemical attacks, and extreme weather.",
    image: "/assets/brochures/real_one_page_2.jpg",
    specs: "ASTM C836 Compliant | 15+ Years Life",
  },
  {
    title: "Hot Applied Bitumen & Primers",
    description: "Industrial-grade hot bitumen applications delivering seamless, puncture-resistant waterproofing for foundations and bridge decks.",
    image: "/assets/brochures/real_one_page_3.jpg",
    specs: "Multi-layer Membrane | High Elasticity",
  },
  {
    title: "Polymer Membrane Sheets",
    description: "Advanced APP & SBS modified torch-on membrane sheets with reinforced polyester matting for high-load basement retaining walls.",
    image: "/assets/brochures/Water_Stopper_123_page_1.jpg",
    specs: "5 Bar Hydrostatic Proof | Self-Adhesive",
  },
  {
    title: "Structural Termite & Pest Barrier",
    description: "Deep soil chemical impregnation and pre-construction termite barriers ensuring permanent protection for foundations and timbers.",
    image: "/assets/brochures/real_one_page_1.jpg",
    specs: "Long-term Residual Action | Eco-Safe",
  },
  {
    title: "Thermal & Heat Insulation Slabs",
    description: "High-density extruded polystyrene (XPS) and polyurethane thermal insulation to reduce heat transfer and optimize HVAC efficiency.",
    image: "/assets/brochures/Profile_marblex_page_4.jpg",
    specs: "Low Thermal Conductivity | Zero Degradation",
  }
];

export const ServicesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] font-bold text-xs tracking-widest uppercase mb-4 border border-[#ff6b4a]/20">
          <ShieldOutlinedIcon sx={{ fontSize: 16 }} /> MARBLEX Engineering Solutions
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0f1929] tracking-tight mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
          Industrial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73]">Services & Solutions</span>
        </h1>
        <p className="text-base md:text-lg text-[#565e69] font-normal max-w-2xl mx-auto leading-relaxed">
          Engineered construction chemicals, elastomeric rubber water stops, and thermal barrier systems customized for civil infrastructure and commercial projects.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="group rounded-3xl overflow-hidden card-shadow card-3d border border-[#e0e6ed] bg-white flex flex-col transition-all duration-300 hover:border-[#ff6b4a]/40">
            <div className="h-[240px] overflow-hidden relative bg-[#f5f7fa]">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-md text-[#0a3d52] text-[10px] font-bold px-3 py-1 rounded-lg">
                {service.specs}
              </div>
            </div>
            <div className="p-7 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-[#0f1929] mb-3 group-hover:text-[#ff6b4a] transition-colors" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
                {service.title}
              </h3>
              <p className="text-sm text-[#565e69] mb-6 leading-relaxed flex-1 font-normal">
                {service.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#e0e6ed] mt-auto">
                <button onClick={() => navigate('/catalogs')} className="text-xs font-bold text-[#0a3d52] hover:text-[#ff6b4a] flex items-center gap-1.5 transition-colors uppercase tracking-wider font-subheading">
                  View Specifications <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </button>
                <a 
                  href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20want%20to%20inquire%20about%20${encodeURIComponent(service.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  title="WhatsApp Inquiry"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action Card */}
      <div className="mt-20 bg-[#0a3d52] rounded-3xl p-8 sm:p-14 text-center text-white card-shadow relative overflow-hidden border border-[#0a3d52]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b4a]/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-block py-1 px-3.5 rounded-full bg-white/10 text-[#ff8c73] text-xs font-bold uppercase tracking-widest mb-4">
            Technical Assistance
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
            Need Expert Structural Consultation?
          </h2>
          <p className="text-slate-200 text-sm sm:text-base mb-8 leading-relaxed font-normal">
            Speak directly with our chemical engineers for custom specifications, on-site testing, and certified material supply.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/catalogs')} className="btn-3d-accent px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider">
              Download Specifications
            </button>
            <button onClick={() => navigate('/contact')} className="btn-3d-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-[#0a3d52]">
              Contact Engineering Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
