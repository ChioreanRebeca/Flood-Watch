

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

app.use(cors());
app.use(express.json());

const {
  TWILIO_ACCOUNT_SID= '/',
  TWILIO_AUTH_TOKEN = '/',
  TWILIO_PHONE_NUMBER = '+/',
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error(
    'Missing Twilio environment variables. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.'
  );
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const isE164PhoneNumber = (phoneNumber) => {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber);
};

app.post('/api/send-sms', async (req, res) => {
  const { message, to } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Message is required',
    });
  }

  if (!to || typeof to !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Phone number is required',
    });
  }

  if (!isE164PhoneNumber(to)) {
    return res.status(400).json({
      success: false,
      error:
        'Phone number must be in E.164 format, for example +407xxxxxxxx',
    });
  }

  try {
    const smsResponse = await client.messages.create({
      body: `FloodWatch Alert: ${message}`,
      from: TWILIO_PHONE_NUMBER,
      to,
    });

    console.log('SMS request accepted by Twilio:', {
      sid: smsResponse.sid,
      status: smsResponse.status,
      to,
    });

    return res.status(200).json({
      success: true,
      sid: smsResponse.sid,
      status: smsResponse.status,
    });
  } catch (error) {
    console.error('Twilio API Error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo,
    });

    return res.status(error.status || 500).json({
      success: false,
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });
  }
});

app.listen(5000, () => {
  console.log('Backend server is running on http://localhost:5000');
});