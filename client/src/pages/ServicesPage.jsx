import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const services = [
  {
    title: "Chemicals Coating",
    description: "High-performance chemical coatings to protect and enhance your structures against extreme weather and wear.",
    image: "/assets/brochures/real_one_page_2.jpg"
  },
  {
    title: "Hot Bitumen",
    description: "Premium hot bitumen applications ensuring robust, seamless, and long-lasting waterproofing.",
    image: "/assets/brochures/real_one_page_3.jpg"
  },
  {
    title: "Membrane Sheet",
    description: "Advanced membrane sheets for superior moisture barriers in critical construction projects.",
    image: "/assets/brochures/Water_Stopper_123_page_1.jpg"
  },
  {
    title: "Termite Treatment",
    description: "Professional termite control solutions to safeguard the structural integrity of your buildings.",
    image: "/assets/brochures/real_one_page_1.jpg"
  },
  {
    title: "Heat Insulation",
    description: "Energy-efficient heat insulation services to regulate temperatures and reduce energy costs.",
    image: "/assets/brochures/Profile_marblex_page_4.jpg"
  }
];

export const ServicesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="text-center mb-16 pt-8">
        <span className="inline-block py-1.5 px-4 rounded-full bg-slate-100 text-slate-600 font-bold text-sm tracking-widest uppercase mb-6 shadow-sm border border-slate-200">
          Marblex Expertise
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
          Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-700">Services</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
          We deal in all kinds of waterproofing products, chemical coating, hot bitumen, membrane sheet, termite treatment, and heat insulation.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 border border-slate-200 bg-white flex flex-col">
            <div className="h-[250px] overflow-hidden relative">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{service.title}</h3>
              <p className="text-slate-600 font-medium mb-8 leading-relaxed flex-1">
                {service.description}
              </p>
              <button onClick={() => navigate('/catalogs')} className="text-rose-600 font-bold hover:text-rose-700 flex items-center gap-2 mt-auto self-start">
                View Brochure <ArrowForwardIcon fontSize="small" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Need a consultation?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Contact Marblex Construction Chemical & Rubber Industry today to get a quote or to learn more about how our services can protect your next project.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/catalogs')} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-full font-bold text-base transition-all shadow-lg shadow-rose-600/30">
              Explore Catalogs
            </button>
            <button onClick={() => navigate('/contact')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-base transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
