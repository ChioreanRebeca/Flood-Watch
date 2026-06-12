// server.js (Back-end)
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// You get these from your Twilio Console (KEEP THEM SECRET!)
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER';

const client = twilio(accountSid, authToken);

app.post('/api/send-sms', async (req, res) => {
  const { message, to } = req.body;

  try {
    const smsResponse = await client.messages.create({
      body: `FloodWatch Alert: ${message}`,
      from: twilioPhoneNumber,
      to: to // The user's actual phone number
    });
    
    res.status(200).json({ success: true, sid: smsResponse.sid });
  } catch (error) {
    console.error("Failed to send SMS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));