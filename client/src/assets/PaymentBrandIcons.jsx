import React from "react";

/**
 * High-Definition Payment Brand Badges & Official Icons
 * Uses official brand graphics with pixel-perfect scaling on all viewports.
 */

// 1. Official High-Definition Stripe & Card Badge
export const StripeCardIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}>
    <svg
      className="w-full h-full"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#635BFF" />
      {/* Card overlay shine */}
      <rect x="8" y="14" width="48" height="36" rx="6" fill="#4B45D6" opacity="0.6" />
      <rect x="8" y="20" width="48" height="6" fill="#3832B5" opacity="0.8" />
      <rect x="14" y="32" width="10" height="7" rx="1.5" fill="#FFD700" />
      {/* Stripe Wordmark in crisp vector */}
      <path
        d="M34.8 28.6c0-1.7 1.4-2.5 3.7-2.5 3.3 0 7.4 1.1 10.7 3v-7.8c-3.6-1.4-7.3-2-10.7-2-8.8 0-14.8 4.6-14.8 12.4 0 12.1 16.5 10.1 16.5 15.3 0 2-1.7 2.7-4.1 2.7-3.7 0-8.6-.2-12.1-3.7v8.5c4 1.7 8.3 2.5 12.1 2.5 9.1 0 15.4-4.4 15.4-12.5 0-13.1-16.7-10.8-16.7-15.9z"
        fill="#FFFFFF"
      />
    </svg>
  </div>
);

// 2. Official High-Definition Easypaisa Icon (Using User Uploaded Official Asset)
export const EasypaisaIcon = ({ className = "w-9 h-9 sm:w-10 sm:h-10" }) => (
  <div className={`relative flex items-center justify-center p-1 bg-white dark:bg-white rounded-lg shadow-2xs border border-slate-200/80 dark:border-slate-700/60 overflow-hidden ${className}`}>
    <img
      src="/images/easypaisa.png"
      alt="Easypaisa"
      className="w-full h-full object-contain scale-[1.15] object-center transform"
      onError={(e) => {
        // Fallback to crisp SVG
        e.currentTarget.style.display = "none";
        if (e.currentTarget.nextElementSibling) {
          e.currentTarget.nextElementSibling.style.display = "block";
        }
      }}
    />
    <svg
      style={{ display: "none" }}
      className="w-full h-full"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

// 3. Official High-Definition JazzCash Icon (Using User Uploaded Official Asset)
export const JazzCashIcon = ({ className = "w-9 h-9 sm:w-10 sm:h-10" }) => (
  <div className={`relative flex items-center justify-center p-1 bg-white dark:bg-white rounded-lg shadow-2xs border border-slate-200/80 dark:border-slate-700/60 overflow-hidden ${className}`}>
    <img
      src="/images/jazzcash.png"
      alt="JazzCash"
      className="w-full h-full object-contain scale-[1.15] object-center transform"
      onError={(e) => {
        // Fallback to crisp SVG
        e.currentTarget.style.display = "none";
        if (e.currentTarget.nextElementSibling) {
          e.currentTarget.nextElementSibling.style.display = "block";
        }
      }}
    />
    <svg
      style={{ display: "none" }}
      className="w-full h-full"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#141414" />
      <path
        d="M17 18C17 18 27 15 36 24C45 33 39 46 39 46L29 38C29 38 33 30 27 24L17 18Z"
        fill="#FF1E27"
      />
      <path
        d="M47 46C47 46 37 49 28 40C19 31 25 18 25 18L35 26C35 26 31 34 37 40L47 46Z"
        fill="#FFD200"
      />
      <circle cx="32" cy="32" r="5" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="3.2" fill="#E60000" />
    </svg>
  </div>
);

// 4. Official High-Definition Corporate Bank IBFT Icon
export const BankTransferIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}>
    <svg
      className="w-full h-full"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#0A3D52" />
      {/* Neoclassical Roof */}
      <path d="M32 15L14 24V27H50V24L32 15Z" fill="#FFFFFF" />
      {/* Architrave Bar */}
      <rect x="16" y="28" width="32" height="3" rx="0.5" fill="#38BDF8" />
      {/* 4 Bank Pillars */}
      <rect x="18" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="25.5" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="34" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      <rect x="41.5" y="32" width="4.5" height="13" rx="1" fill="#FFFFFF" />
      {/* Base Podium & IBFT Label */}
      <rect x="13" y="46" width="38" height="4" rx="1" fill="#38BDF8" />
    </svg>
  </div>
);

// 5. Cash on Delivery (COD) Van & Shield Icon
export const CodTruckIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}>
    <svg
      className="w-full h-full"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#0284C7" />
      <path
        d="M18 24H36V40H18V24ZM36 29H43L47 34V40H36V29ZM24 44C25.4 44 26.5 42.9 26.5 41.5C26.5 40.1 25.4 39 24 39C22.6 39 21.5 40.1 21.5 41.5C21.5 42.9 22.6 44 24 44ZM42 44C43.4 44 44.5 42.9 44.5 41.5C44.5 40.1 43.4 39 42 39C40.6 39 39.5 40.1 39.5 41.5C39.5 42.9 40.6 44 42 44Z"
        fill="#FFFFFF"
      />
    </svg>
  </div>
);

// 6. Payment Method Section Title Header Icon (with URL support & crisp SVG fallback)
export const PaymentHeaderBadge = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMhlyNEHsAC6KC8-ZmAaLF2IUt-_hPggCZ4OcKyxTqgw&s=10"
        alt="Payment Method"
        className="w-full h-full object-contain rounded"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          if (e.currentTarget.nextElementSibling) {
            e.currentTarget.nextElementSibling.style.display = "block";
          }
        }}
      />
      <svg
        style={{ display: "none" }}
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="#FF6B4A" strokeWidth="2" />
        <line x1="2" y1="10" x2="22" y2="10" stroke="#FF6B4A" strokeWidth="2" />
        <rect x="5" y="14" width="4" height="2" rx="0.5" fill="#FF6B4A" />
      </svg>
    </div>
  );
};
