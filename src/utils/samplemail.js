import SibApiV3Sdk from "sib-api-v3-sdk";

// ============================
// Configure Brevo API
// ============================
const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = "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";

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ============================
// Send Email Function
// ============================
async function sendTestEmail() {
  try {
    const emailData = {
      sender: {
        name: "EduHub",
        email: "dreaminalgodevelopmement@gmail.com", // must be verified
      },
      to: [
        {
          email: "vignesh2024a@gmail.com",
        },
      ],
      subject: "Brevo Test Email",
      htmlContent: "<h2>Success! Brevo is working 🚀</h2>",
    };

    const response = await emailApi.sendTransacEmail(emailData);

    console.log("✅ Email Sent:", response.messageId);
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error);
  }
}

sendTestEmail();
