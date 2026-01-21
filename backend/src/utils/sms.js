import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTPSMS(phoneNumber, otp) {
  try {
    await client.messages.create({
      body: `Your CloudDrive verification code is: ${otp}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    throw new Error('Failed to send SMS');
  }
}