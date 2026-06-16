import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { sendSmsAlert } from '../../services/smsService';

export default function ReportIncidentModal({ onClose } = {}) {
  const { draftReport, setDraftReport, setReportedIncidents } = useAppState();

  const [type, setType] = useState('Flooded Road');
  const [details, setDetails] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Use full E.164 format, for example: +407xxxxxxxx
  // For a Twilio trial account, this destination number must be verified in Twilio.
  const emergencyPhoneNumber = '+/';

  // IMPORTANT:
  // The modal should open when draftReport exists.
  // Do NOT require an isOpen prop, because App.jsx renders <ReportIncidentModal /> without one.
  if (!draftReport) return null;

  const resetForm = () => {
    setDraftReport(null);
    setDetails('');
    setType('Flooded Road');

    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSending) return;

    const newReport = {
      id: Date.now(),
      lat: draftReport.lat,
      lng: draftReport.lng,
      type,
      details,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const smsMessage = `
Incident: ${type}
Details: ${details}
Location: ${draftReport.lat}, ${draftReport.lng}
Time: ${newReport.time}
    `.trim();

    setIsSending(true);

    // Post the report locally even if SMS fails.
    setReportedIncidents((prev) => [...prev, newReport]);

    try {
   const smsResult = await sendSmsAlert(smsMessage, emergencyPhoneNumber);

      console.log('Report posted and SMS sent successfully:', smsResult);
    } catch (error) {
      console.error('SMS failed:', error);

      // No popup here.
      // The report is still posted locally even if SMS fails.
    } finally {
      setIsSending(false);
      resetForm();
    }
  };

  const handleCancel = () => {
    if (isSending) return;
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-orange-400 mb-2 flex items-center gap-2">
          Submit Incident Report
        </h2>

        <p className="text-xs text-gray-400 mb-4">
          Selected location:{' '}
          <span className="font-mono text-gray-300">
            {draftReport.lat.toFixed(6)}, {draftReport.lng.toFixed(6)}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Incident Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isSending}
              className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded p-2 text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50"
            >
              <option>Flooded Road</option>
              <option>Damaged Infrastructure</option>
              <option>Trapped Individuals</option>
              <option>Rising Water Levels</option>
              <option>Other Hazard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Additional Details
            </label>

            <textarea
              required
              rows="3"
              placeholder="Describe the situation, e.g. 'Water is over the bridge...'"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={isSending}
              className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded p-2 text-sm focus:outline-none focus:border-orange-500 resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSending}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm font-bold shadow-lg transition-colors disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Post Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}