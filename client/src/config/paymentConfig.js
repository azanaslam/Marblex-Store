// Payment Gateway Configurations & Placeholders for Client
// These defaults are used if the backend dynamic config is loading or unavailable.

export const DEFAULT_PAYMENT_CONFIG = {
  currency: "PKR",
  bulkThresholdAmount: 50000,
  bulkThresholdItems: 10,
  whatsapp: {
    number: import.meta.env.VITE_WHATSAPP_NUMBER || "923084585792",
    formattedNumber: "+92 308 4585792",
    label: "Official MARBLEX Engineering Sales",
  },
  easypaisa: {
    accountTitle: import.meta.env.VITE_EASYPAISA_TITLE || "MARBLEX CHEMICAL & RUBBER",
    accountNumber: import.meta.env.VITE_EASYPAISA_NUMBER || "0348-1116611",
    instructions:
      "Open your Easypaisa App or dial *786# to send the order amount. Copy the Transaction ID (TID) from the SMS confirmation and enter it below.",
  },
  jazzcash: {
    accountTitle: import.meta.env.VITE_JAZZCASH_TITLE || "MARBLEX CHEMICAL & RUBBER",
    accountNumber: import.meta.env.VITE_JAZZCASH_NUMBER || "0300-XXXXXXX",
    instructions:
      "Send payment to our JazzCash account. Enter the 12-digit Transaction ID (TID) received via SMS in the field below.",
  },
  bankTransfer: {
    bankName: import.meta.env.VITE_BANK_NAME || "Meezan Bank Limited",
    accountTitle: import.meta.env.VITE_BANK_TITLE || "MARBLEX CHEMICAL & RUBBER INDUSTRY",
    accountNumber: import.meta.env.VITE_BANK_ACCOUNT || "0101-XXXXXXXXXXXX",
    iban: import.meta.env.VITE_BANK_IBAN || "PK00MEZN0000000000000000",
    branch: import.meta.env.VITE_BANK_BRANCH || "Ferozepur Road Branch, Lahore",
    instructions:
      "Transfer amount using online banking / ATM IBFT. Enter the Bank Reference / Transaction ID and optionally attach your transfer receipt.",
  },
  stripe: {
    enabled: true,
  },
};
