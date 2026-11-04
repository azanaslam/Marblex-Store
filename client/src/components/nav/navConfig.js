import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";

export const NAV_ITEMS = [
  {
    id: "home",
    labelKey: "nav.home",
    defaultLabel: "Home",
    path: "/",
    icon: HomeOutlinedIcon,
    descKey: "nav.homeDesc",
    defaultDesc: "Products & industrial solutions",
  },
  {
    id: "services",
    labelKey: "nav.services",
    defaultLabel: "Services",
    path: "/services",
    icon: ConstructionOutlinedIcon,
    descKey: "nav.servicesDesc",
    defaultDesc: "Site systems & applications",
  },
  {
    id: "tools",
    labelKey: "nav.tools",
    defaultLabel: "Tools",
    icon: CalculateOutlinedIcon,
    isDropdown: true,
    children: [
      {
        id: "calculator",
        labelKey: "nav.calculator",
        defaultLabel: "Coverage Calculator",
        path: "/calculator",
        icon: CalculateOutlinedIcon,
        descKey: "nav.coverageDesc",
        defaultDesc: "Material coverage estimator",
      },
      {
        id: "finder",
        labelKey: "nav.finder",
        defaultLabel: "Product Finder",
        path: "/product-finder",
        icon: TravelExploreOutlinedIcon,
        descKey: "nav.finderDesc",
        defaultDesc: "Guided system selector",
      },
    ],
  },
  {
    id: "resources",
    labelKey: "nav.resources",
    defaultLabel: "Resources",
    icon: MenuBookOutlinedIcon,
    isDropdown: true,
    children: [
      {
        id: "catalogs",
        labelKey: "nav.catalogs",
        defaultLabel: "Catalogs",
        path: "/catalogs",
        icon: MenuBookOutlinedIcon,
        descKey: "nav.catalogsDesc",
        defaultDesc: "TDS packs & brochures",
      },
      {
        id: "blogs",
        labelKey: "nav.blogs",
        defaultLabel: "Blogs",
        path: "/blogs",
        icon: ArticleOutlinedIcon,
        descKey: "nav.blogsDesc",
        defaultDesc: "Field guides & insights",
      },
    ],
  },
  {
    id: "about",
    labelKey: "nav.about",
    defaultLabel: "About",
    path: "/about",
    icon: InfoOutlinedIcon,
    descKey: "nav.aboutDesc",
    defaultDesc: "Company legacy & mission",
  },
  {
    id: "contact",
    labelKey: "nav.contact",
    defaultLabel: "Contact",
    path: "/contact",
    icon: EmailOutlinedIcon,
    descKey: "nav.contactDesc",
    defaultDesc: "Engineering desk & support",
  },
];

export const WHATSAPP_QUOTE_URL =
  "https://wa.me/923084585792?text=Hello%20MARBLEX,%20I%20would%20like%20to%20request%20a%20free%20quote%20for%20construction%20chemicals%20and%20industrial%20solutions.";
export const PHONE_NUMBER = "03084585792";
