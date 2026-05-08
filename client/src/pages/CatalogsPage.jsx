import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const catalogs = [
  {
    id: "profile",
    title: "Company Profile",
    description: "Learn about Marblex Construction Chemical & Rubber Industry, our projects, and services.",
    pages: Array.from({ length: 10 }, (_, i) => `/assets/brochures/Profile_marblex_page_${i + 1}.jpg`),
  },
  {
    id: "construction",
    title: "Construction Projects & Treatments",
    description: "Explore our termite treatments, waterproofing, and construction management solutions.",
    pages: Array.from({ length: 4 }, (_, i) => `/assets/brochures/real_one_page_${i + 1}.jpg`),
  },
  {
    id: "waterstopper",
    title: "Rubber Water Stopper",
    description: "Detailed specifications, features, and applications of our premium rubber water stops.",
    pages: Array.from({ length: 2 }, (_, i) => `/assets/brochures/Water_Stopper_123_page_${i + 1}.jpg`),
  },
];

export const CatalogsPage = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = catalogs.find(c => c.id === tabParam) ? tabParam : catalogs[0].id;
  const [activeCatalog, setActiveCatalog] = useState(initialTab);

  // Update active catalog when URL query param changes (e.g. navigating from different service cards)
  useEffect(() => {
    if (tabParam && catalogs.find(c => c.id === tabParam)) {
      setActiveCatalog(tabParam);
    }
  }, [tabParam]);

  const selectedCatalog = catalogs.find(c => c.id === activeCatalog);

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-16">
      <div className="text-center mb-12 mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Our Catalogs & Brochures
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          Explore our detailed company profile, product catalogs, and service brochures.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 px-3">
              Available Catalogs
            </h3>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x">
              {catalogs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCatalog(cat.id)}
                  className={`flex-shrink-0 snap-start text-left px-5 py-4 rounded-2xl transition-all duration-300 ${
                    activeCatalog === cat.id
                      ? "bg-rose-50 border-rose-200 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-slate-50"
                  } border`}
                >
                  <h4 className={`font-extrabold text-base mb-1 ${activeCatalog === cat.id ? "text-rose-600" : "text-slate-700"}`}>
                    {cat.title}
                  </h4>
                  <p className={`text-xs font-medium line-clamp-2 ${activeCatalog === cat.id ? "text-rose-500/80" : "text-slate-500"}`}>
                    {cat.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedCatalog.title}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">{selectedCatalog.pages.length} Pages</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-8 bg-slate-100">
              <div className="max-w-4xl mx-auto space-y-6">
                {selectedCatalog.pages.map((pageImg, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
                    <img 
                      src={pageImg} 
                      alt={`${selectedCatalog.title} - Page ${idx + 1}`}
                      className="w-full h-auto object-contain block"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Page {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
