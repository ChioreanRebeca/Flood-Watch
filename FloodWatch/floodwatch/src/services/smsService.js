const API_URL = 'http://localhost:5000/api/send-sms';

export const sendSmsAlert = async (message, phoneNumber) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      to: phoneNumber,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || !data.success) {
    const errorMessage = data.error || 'Failed to send SMS';
    const twilioCode = data.code ? ` Twilio code: ${data.code}.` : '';
    const moreInfo = data.moreInfo ? ` More info: ${data.moreInfo}` : '';

    throw new Error(`${errorMessage}.${twilioCode}${moreInfo}`);
  }

  console.log('SMS sent successfully!', data.sid);

  return data;
};