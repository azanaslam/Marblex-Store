const env = require("./env");

const paymentConfig = {
  currency: "PKR",
  bulkThresholdAmount: 50000,
  bulkThresholdItems: 10,
  whatsapp: {
    number: env.whatsappNumber,
    formattedNumber: "+92 308 4585792",
    label: "Official MARBLEX Sales Hotline",
  },
  easypaisa: {
    accountTitle: env.easypaisaTitle,
    accountNumber: env.easypaisaNumber,
    instructions:
      "1. Open your Easypaisa app or dial *786#.\n2. Send the exact order total to the account number above.\n3. Note down the Transaction ID (TID) from the confirmation SMS / Receipt.\n4. Paste the TID in the field below and optionally upload your receipt screenshot.",
  },
  jazzcash: {
    accountTitle: env.jazzcashTitle,
    accountNumber: env.jazzcashNumber,
    instructions:
      "1. Open your JazzCash app or dial *786#.\n2. Send money to the JazzCash mobile account number above.\n3. Copy the 12-digit Transaction ID (TID) received via SMS.\n4. Enter the Transaction ID below and submit your order.",
  },
  bankTransfer: {
    bankName: env.bankName,
    accountTitle: env.bankTitle,
    accountNumber: env.bankAccount,
    iban: env.bankIban,
    branch: env.bankBranch,
    instructions:
      "1. Transfer the order amount via your Bank App / Online Banking (IBFT) or ATM deposit.\n2. Use your Phone Number or Order Reference in the transfer remarks.\n3. Enter the Bank Transaction / Reference ID below and optionally attach a receipt screenshot.",
  },
  stripe: {
    enabled: Boolean(env.stripeSecretKey),
    currency: env.stripeCurrency,
  },
};

module.exports = paymentConfig;
