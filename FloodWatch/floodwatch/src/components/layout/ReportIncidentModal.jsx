import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { sendSmsAlert } from '../../services/smsService'; // <-- 1. Import the SMS service

export default function ReportIncidentModal() {
  const { draftReport, setDraftReport, setReportedIncidents } = useAppState();
  const [type, setType] = useState('Flooded Road');
  const [details, setDetails] = useState('');
  
  // <-- 2. Add loading state for the SMS network request
  const [isSendingSms, setIsSendingSms] = useState(false); 

  if (!draftReport) return null;

  // <-- 3. Make the submit function async to handle the SMS promise
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create the new report object
    const newReport = {
      id: Date.now(),
      lat: draftReport.lat,
      lng: draftReport.lng,
      type,
      details,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Add it to your visual map state
    setReportedIncidents(prev => [...prev, newReport]);
    
    // <-- 4. SMS Alert Logic
    // Define which incident types should trigger an emergency SMS to the admin
    const isCritical = 
      type === 'Trapped Individuals' || 
      type === 'Rising Water Levels' || 
      type === 'Damaged Infrastructure';
    
    if (isCritical) {
      setIsSendingSms(true);
      const adminPhone = "+40700000000"; // Replace with actual admin phone (keep +40)
      
      // Construct a helpful message with the exact coordinates and details
      const message = `${type} reported! Details: "${details}". Location: Lat ${draftReport.lat.toFixed(4)}, Lng ${draftReport.lng.toFixed(4)}.`;
      
      await sendSmsAlert(message, adminPhone);
      setIsSendingSms(false);
    }

    // Close modal and reset form
    setDraftReport(null); 
    setDetails('');       
    setType('Flooded Road');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
          <span></span> Submit Incident Report
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Incident Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded p-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option>Flooded Road</option>
              <option>Damaged Infrastructure</option>
              <option>Trapped Individuals</option>
              <option>Rising Water Levels</option>
              <option>Other Hazard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Additional Details</label>
            <textarea 
              required
              rows="3"
              placeholder="Describe the situation (e.g., 'Water is over the bridge...')"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded p-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setDraftReport(null)}
              disabled={isSendingSms} // Prevent closing while sending
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {/* <-- 5. Update the button to show a loading state */}
            <button 
              type="submit"
              disabled={isSendingSms}
              className={`flex-1 py-2 text-white rounded text-sm font-bold shadow-lg transition-colors ${
                isSendingSms 
                  ? 'bg-orange-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              {isSendingSms ? 'Sending Alert...' : 'Post Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}