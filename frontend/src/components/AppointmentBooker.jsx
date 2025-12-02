// src/components/AppointmentBooker.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { api } from '../api/api';
import { Calendar, Heart } from 'lucide-react';

const AppointmentBooker = ({ patientId: propPatientId, currentRiskLevel = 'moderate' }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error' | ''

  const messageRef = useRef(null);

  // Controlled form state
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    requestedTime: '',
    notes: '',
    patientId: propPatientId || '',
  });

  // keep patientId in sync if prop changes
  useEffect(() => {
    setBookingData(prev => ({ ...prev, patientId: propPatientId || prev.patientId || '' }));
  }, [propPatientId]);

  // Helper: get auth token & normalize patient id from localStorage (adjust to your auth pattern)
  const getAuthToken = useCallback(() => localStorage.getItem('token'), []);
  const getAuthPatientId = useCallback(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u?._id ?? u?.id ?? '';
    } catch (e) {
      return '';
    }
  }, []);

  // helper: returns local datetime string suitable for datetime-local min attribute
  const getLocalDatetimeLocalMin = useCallback(() => {
    const now = new Date();
    // round up to next minute to avoid seconds problems
    now.setSeconds(0, 0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISO = new Date(now - tzOffset).toISOString().slice(0, 16);
    return localISO;
  }, []);

  // memoize min value so it doesn't change every render
  const minDatetimeLocal = useMemo(() => getLocalDatetimeLocalMin(), [getLocalDatetimeLocalMin()]);

  // fetch doctors on mount
  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setMessage('');
        // NOTE: your server route is /api/appointments/doctors/available; your axios baseURL may vary
        const res = await api.get('/appointments/doctors/available', { signal: controller.signal });
        const list = res?.data?.data ?? res?.data ?? [];
        setDoctors(Array.isArray(list) ? list.filter(Boolean) : []);
      } catch (error) {
        const isAbort =
          error?.name === 'CanceledError' ||
          error?.name === 'AbortError' ||
          error?.code === 'ERR_CANCELED';
        if (isAbort) return;
        console.error('Failed to fetch doctors:', error?.response?.data ?? error);
        setMessage('Could not load doctor list. Please try again later.');
        setMessageType('error');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();

    return () => controller.abort();
  }, []);

  // Controlled input handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Validation
  const validateBooking = useCallback(() => {
    if (!bookingData.doctorId) {
      setMessage('❌ Please select a doctor before submitting.');
      setMessageType('error');
      return false;
    }
    if (!bookingData.requestedTime) {
      setMessage('❌ Please pick a date and time.');
      setMessageType('error');
      return false;
    }
    const selected = new Date(bookingData.requestedTime);
    if (isNaN(selected.getTime())) {
      setMessage('❌ Invalid date/time selected.');
      setMessageType('error');
      return false;
    }
    const now = new Date();
    if (selected < now) {
      setMessage('❌ Cannot book an appointment in the past.');
      setMessageType('error');
      return false;
    }
    return true;
  }, [bookingData.doctorId, bookingData.requestedTime]);

  // Convert local datetime-local value to an ISO string (UTC)
  const convertToISO = useCallback((localDatetimeLocalStr) => {
    if (!localDatetimeLocalStr) return null;
    // new Date('YYYY-MM-DDTHH:mm') constructs a Date in local timezone on modern browsers
    const dt = new Date(localDatetimeLocalStr);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString();
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!validateBooking()) {
      // focus message for screen readers
      setTimeout(() => messageRef.current?.focus?.(), 0);
      return;
    }

    setIsSubmitting(true);

    try {
      const isoRequested = convertToISO(bookingData.requestedTime);
      const finalPatientId = bookingData.patientId || propPatientId || getAuthPatientId();

      const payload = {
        doctorId: bookingData.doctorId,
        requestedTime: isoRequested,
        notes: bookingData.notes,
        patientId: finalPatientId,
      };

      // Ensure Authorization header — adapt if you already set up an interceptor
      const token = getAuthToken();
      if (token) {
        api.defaults.headers = api.defaults.headers ?? {};
        api.defaults.headers.common = api.defaults.headers.common ?? {};
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // POST: keep same path you used before — adjust if your axios baseURL already contains /api
      const res = await api.post('/appointments/book', payload);
      const created = res.data?.appointment ?? res.data;

      setMessage('✅ Appointment requested successfully! Awaiting doctor confirmation.');
      setMessageType('success');

      // Reset form but keep patientId for convenience
      setBookingData({
        doctorId: '',
        requestedTime: '',
        notes: '',
        patientId: finalPatientId,
      });

      // Optionally: you could push `created` into a local list of appointments if you maintain one
      // focus message for screen readers
      setTimeout(() => messageRef.current?.focus?.(), 0);
    } catch (error) {
      console.error('Booking error:', error?.response?.data ?? error);
      const errMsg = error?.response?.data?.message || error?.message || 'Check connection/ID.';
      setMessage(`❌ Booking failed. ${errMsg}`);
      setMessageType('error');
      setTimeout(() => messageRef.current?.focus?.(), 0);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    bookingData,
    propPatientId,
    convertToISO,
    getAuthPatientId,
    getAuthToken,
    validateBooking
  ]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading available doctors...</div>;

  if (!Array.isArray(doctors) || doctors.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        No doctors available for booking at this time.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-blue-600" /> Book New Appointment
        </h3>

        <div className={`p-3 rounded-lg ${currentRiskLevel === 'critical' ? 'bg-red-100 border-red-400' : 'bg-yellow-100 border-yellow-400'} border-l-4 mb-6`}>
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-600" /> Your Current AI Risk Level:
            <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${currentRiskLevel === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}>
              {currentRiskLevel}
            </span>
          </p>
          <p className="text-xs text-gray-600 mt-1">This appointment will be prioritized based on this score.</p>
        </div>

        {message && (
          <div
            ref={messageRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className={`p-3 rounded-lg text-sm mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
          <div>
            <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
            <select
              id="doctorId"
              name="doctorId"
              required
              value={bookingData.doctorId}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
            >
              <option value="">-- Choose Your Doctor --</option>
              {doctors.map((doctor, idx) => {
                const id = doctor._id ?? doctor.id ?? doctor.idString ?? '';
                const name = doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Unnamed Doctor';
                const specialty = doctor.specialty ?? doctor.specialization ?? 'General Practitioner';
                if (!id) return (
                  <option key={`noprof-${idx}`} value="">
                    {name} ({specialty}) — unavailable
                  </option>
                );
                return (
                  <option key={id || `doc-${idx}`} value={id}>
                    {name} ({specialty})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="requestedTime" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date and Time</label>
            <input
              id="requestedTime"
              name="requestedTime"
              type="datetime-local"
              required
              min={minDatetimeLocal}
              value={bookingData.requestedTime}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Reason for Appointment (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={bookingData.notes}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
              placeholder="e.g., Follow up on high blood pressure readings, general checkup."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || doctors.length === 0}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Appointment Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

AppointmentBooker.propTypes = {
  patientId: PropTypes.string,
  currentRiskLevel: PropTypes.oneOf(['low', 'moderate', 'high', 'critical']),
};

export default AppointmentBooker;
