// src/services/smsService.js

// Replace with your actual backend URL when deployed
const API_URL = 'http://localhost:5000/api/send-sms'; 

export const sendSmsAlert = async (message, phoneNumber) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        to: phoneNumber,
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    console.log("SMS sent successfully!", data.sid);
    return true;
  } catch (error) {
    console.error("Error sending SMS from React:", error);
    return false;
  }
};