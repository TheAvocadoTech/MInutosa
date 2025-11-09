const axios = require("axios");

class SMSService {
  static formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return cleaned.slice(-10);
  }

  static async sendOTP(phoneNumber, otp) {
    try {
      const url = "http://103.231.100.41/websms/sendsms.aspx";

      const USERID = "minutos";
      const PASSWORD = "125PPhD";
      const SENDER = "ITMINE";
      const PEID = "1701158036727349102";
      const TPID = "1707172656144467326";

      // ✅ MUST MATCH TEMPLATE EXACTLY
      const message = `Dear User,
Your OTP for Login is ${otp} This OTP is valid for 3 minutes.
Please do not share OTP with anyone.

INTECH`;

      const encodedMessage = encodeURIComponent(message);

      const finalUrl =
        `${url}?userid=${USERID}` +
        `&password=${PASSWORD}` +
        `&sender=${SENDER}` +
        `&mobileno=${phoneNumber}` +
        `&msg=${encodedMessage}` +
        `&peid=${PEID}` +
        `&tpid=${TPID}`;

      console.log("FINAL SMS URL:", finalUrl);

      const { data } = await axios.get(finalUrl);

      console.log("SMS Response:", data);

      if (String(data).toLowerCase().includes("success")) {
        return { success: true, raw: data };
      }

      return { success: false, raw: data };
    } catch (err) {
      console.error("SMS Error:", err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = SMSService;
