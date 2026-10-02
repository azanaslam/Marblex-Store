import React from "react";

/**
 * High-Definition Payment Brand Badges & Section Icons
 * Crisp vector graphics — no remote/blurry bitmaps.
 */

// 1. Stripe & Card Badge
export const StripeCardIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#635BFF" />
      <rect x="8" y="14" width="48" height="36" rx="6" fill="#4B45D6" opacity="0.6" />
      <rect x="8" y="20" width="48" height="6" fill="#3832B5" opacity="0.8" />
      <rect x="14" y="32" width="10" height="7" rx="1.5" fill="#FFD700" />
      <path
        d="M34.8 28.6c0-1.7 1.4-2.5 3.7-2.5 3.3 0 7.4 1.1 10.7 3v-7.8c-3.6-1.4-7.3-2-10.7-2-8.8 0-14.8 4.6-14.8 12.4 0 12.1 16.5 10.1 16.5 15.3 0 2-1.7 2.7-4.1 2.7-3.7 0-8.6-.2-12.1-3.7v8.5c4 1.7 8.3 2.5 12.1 2.5 9.1 0 15.4-4.4 15.4-12.5 0-13.1-16.7-10.8-16.7-15.9z"
        fill="#FFFFFF"
      />
    </svg>
  </div>
);

// 2. Easypaisa Icon
export const EasypaisaIcon = ({ className = "w-9 h-9 sm:w-10 sm:h-10" }) => (
  <div className={`relative flex items-center justify-center p-1 bg-white dark:bg-white rounded-lg shadow-2xs border border-slate-200/80 dark:border-slate-700/60 overflow-hidden ${className}`}>
    <img
      src="/images/easypaisa.png"
      alt="Easypaisa"
      className="w-full h-full object-contain scale-[1.15] object-center transform"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        if (e.currentTarget.nextElementSibling) {
          e.currentTarget.nextElementSibling.style.display = "block";
        }
      }}
    />
    <svg style={{ display: "none" }} className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#00C853" />
      <circle cx="32" cy="32" r="26" stroke="#48E885" strokeWidth="1.5" opacity="0.4" />
      <path
        d="M32 14C22.059 14 14 22.059 14 32c0 9.941 8.059 18 18 18 6.5 0 12.19-3.45 15.36-8.64l-6.24-3.6C39.2 41.2 35.8 43 32 43c-6.075 0-11-4.925-11-11 0-6.075 4.925-11 11-11 4.5 0 8.36 2.71 10.05 6.6H23v6.5h27C49.8 23.3 41.9 14 32 14z"
        fill="#FFFFFF"
      />
      <circle cx="32" cy="32" r="4" fill="#005722" />
    </svg>
  </div>
);

// 3. JazzCash Icon
export const JazzCashIcon = ({ className = "w-9 h-9 sm:w-10 sm:h-10" }) => (
  <div className={`relative flex items-center justify-center p-1 bg-white dark:bg-white rounded-lg shadow-2xs border border-slate-200/80 dark:border-slate-700/60 overflow-hidden ${className}`}>
    <img
      src="/images/jazzcash.png"
      alt="JazzCash"
      className="w-full h-full object-contain scale-[1.15] object-center transform"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        if (e.currentTarget.nextElementSibling) {
          e.currentTarget.nextElementSibling.style.display = "block";
        }
      }}
    />
    <svg style={{ display: "none" }} className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#141414" />
      <path d="M17 18C17 18 27 15 36 24C45 33 39 46 39 46L29 38C29 38 33 30 27 24L17 18Z" fill="#FF1E27" />
      <path d="M47 46C47 46 37 49 28 40C19 31 25 18 25 18L35 26C35 26 31 34 37 40L47 46Z" fill="#FFD200" />
      <circle cx="32" cy="32" r="5" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="3.2" fill="#E60000" />
    </svg>
  </div>
);

// 4. Corporate Bank IBFT Icon
export const BankTransferIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0A3D52" />
      <path d="M32 15L14 24V27H50V24L32 15Z" fill="#FFFFFF" />
      <rect x="16" y="28" width="32" height="3" rx="0.5" fill="#38BDF8" />
      <rect x="18" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="25.5" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="34" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="41.5" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="13" y="46" width="38" height="4" rx="1" fill="#38BDF8" />
    </svg>
  </div>
);

// 5. Cash on Delivery — premium truck tile
export const CodTruckIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="codGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D4E68" />
          <stop offset="1" stopColor="#0A3D52" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#codGrad)" />
      <circle cx="48" cy="16" r="10" fill="#FF6B4A" opacity="0.22" />
      {/* Truck body */}
      <path
        d="M12 28.5c0-1.4 1.1-2.5 2.5-2.5H34v16H14.5c-1.4 0-2.5-1.1-2.5-2.5V28.5z"
        fill="#FFFFFF"
      />
      <path
        d="M34 26h7.2c.8 0 1.5.4 1.9 1.1l4.4 7.2c.2.4.3.8.3 1.2V42H34V26z"
        fill="#E8F4F8"
      />
      <path d="M34 26v9h13.2l-3.8-6.2c-.3-.5-.8-.8-1.4-.8H34z" fill="#FF6B4A" />
      <rect x="36.5" y="28.5" width="5.5" height="4.5" rx="1" fill="#0A3D52" opacity="0.35" />
      {/* Wheels */}
      <circle cx="20" cy="44" r="4.2" fill="#0A3D52" />
      <circle cx="20" cy="44" r="1.8" fill="#FFFFFF" />
      <circle cx="42" cy="44" r="4.2" fill="#0A3D52" />
      <circle cx="42" cy="44" r="1.8" fill="#FFFFFF" />
      {/* Shield check */}
      <path
        d="M22 20.5l4-1.5 4 1.5v3.2c0 2.4-1.6 4.5-4 5.3-2.4-.8-4-2.9-4-5.3V20.5z"
        fill="#16A672"
      />
      <path d="M23.8 24.1l1.7 1.7 3.2-3.2" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// 6. Online Payment — secure card + signal (replaces weird PAY ONLINE bitmap)
export const OnlinePaymentIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="onlineGrad" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A4D" />
          <stop offset="1" stopColor="#E65636" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#onlineGrad)" />
      <circle cx="50" cy="14" r="12" fill="#FFFFFF" opacity="0.12" />
      {/* Card */}
      <rect x="12" y="18" width="40" height="28" rx="5" fill="#FFFFFF" />
      <rect x="12" y="24" width="40" height="6" fill="#0A3D52" />
      <rect x="16" y="34" width="12" height="5" rx="1.5" fill="#FFD166" />
      <rect x="31" y="34.5" width="8" height="2" rx="1" fill="#C5D4DC" />
      <rect x="31" y="38.5" width="14" height="2" rx="1" fill="#C5D4DC" />
      {/* Secure lock badge */}
      <circle cx="46" cy="42" r="9" fill="#0A3D52" />
      <path
        d="M46 37.2c-1.5 0-2.7 1.2-2.7 2.7v1.4h5.4v-1.4c0-1.5-1.2-2.7-2.7-2.7z"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="42.6" y="40.8" width="6.8" height="5.2" rx="1.2" fill="#FFFFFF" />
      <circle cx="46" cy="43.2" r="1" fill="#0A3D52" />
    </svg>
  </div>
);

// 7. Payment Method section header icon
export const PaymentHeaderBadge = ({ className = "w-6 h-6" }) => (
  <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="payHeadGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D4E68" />
          <stop offset="1" stopColor="#0A3D52" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#payHeadGrad)" />
      <rect x="8" y="12" width="24" height="16" rx="3.5" fill="#FFFFFF" />
      <rect x="8" y="15.5" width="24" height="3.5" fill="#FF6B4A" />
      <rect x="11" y="22" width="7" height="3" rx="1" fill="#FFD166" />
      <rect x="20" y="22.5" width="9" height="2" rx="1" fill="#B7C9D2" />
    </svg>
  </div>
);

// 8. Selected Products section header icon
export const SelectedProductsIcon = ({ className = "w-6 h-6" }) => (
  <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cartHeadGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A4D" />
          <stop offset="1" stopColor="#E65636" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#cartHeadGrad)" />
      <path
        d="M11 13.5h2.2l1.1 1.8h15.2c.7 0 1.2.7 1 1.3l-2.1 7.2c-.2.6-.7 1-1.3 1H16.2c-.6 0-1.1-.4-1.3-1L12.4 13.5H11z"
        fill="#FFFFFF"
      />
      <circle cx="17.2" cy="28.2" r="1.8" fill="#FFFFFF" />
      <circle cx="25.8" cy="28.2" r="1.8" fill="#FFFFFF" />
      <path d="M19.5 11.5h5.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <circle cx="30.5" cy="12.5" r="4.2" fill="#0A3D52" />
      <path d="M28.8 12.5h3.4M30.5 10.8v3.4" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </div>
);

// 9. Delivery & Contact section header icon
export const DeliveryContactIcon = ({ className = "w-6 h-6" }) => (
  <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="delHeadGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F7C8F" />
          <stop offset="1" stopColor="#0A3D52" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#delHeadGrad)" />
      {/* Van */}
      <path d="M8 18.5h12.5v10H10.2c-1.2 0-2.2-1-2.2-2.2V18.5z" fill="#FFFFFF" />
      <path d="M20.5 18.5h4.2c.5 0 1 .3 1.2.7L28.5 24v4.5h-8V18.5z" fill="#E8F4F8" />
      <path d="M20.5 18.5v5.5H27l-2.2-4.2c-.2-.4-.6-.7-1-.7h-3.3z" fill="#FF6B4A" />
      <circle cx="13.2" cy="29.8" r="2.2" fill="#0A3D52" />
      <circle cx="13.2" cy="29.8" r="0.9" fill="#FFFFFF" />
      <circle cx="25.2" cy="29.8" r="2.2" fill="#0A3D52" />
      <circle cx="25.2" cy="29.8" r="0.9" fill="#FFFFFF" />
      {/* Location pin */}
      <path
        d="M31.5 11.2c-2.1 0-3.8 1.7-3.8 3.8 0 2.8 3.8 6.8 3.8 6.8s3.8-4 3.8-6.8c0-2.1-1.7-3.8-3.8-3.8z"
        fill="#FF6B4A"
      />
      <circle cx="31.5" cy="15" r="1.4" fill="#FFFFFF" />
    </svg>
  </div>
);
