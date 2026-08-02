// utils/sendSMS.js
// Fast2SMS "Quick SMS" route — free-tier available for India numbers.
// Docs: https://www.fast2sms.com/dev/bulkV2
// .env mein FAST2SMS_API_KEY add karna hoga (Fast2SMS dashboard > Dev API > API Key)

const sendSMS = async (phone, message) => {
  // Fast2SMS ko 10-digit Indian number chahiye (bina +91/country code ke)
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q", // Quick SMS route — free-tier / low-cost transactional route
      message,
      language: "english",
      flash: 0,
      numbers: cleanPhone,
    }),
  });

  const data = await response.json();

  if (!data.return) {
    // Fast2SMS returns { return: false, message: "..." } on failure
    throw new Error(data.message || "Failed to send SMS via Fast2SMS");
  }

  return data;
};

export default sendSMS;
