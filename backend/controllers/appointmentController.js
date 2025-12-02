// controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import AISummary from '../models/AISummary.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Helper to calculate the highest risk level string from percentages
const calculateRiskLevel = (summary) => {
  if (!summary) return 'unknown';

  const risks = [
    summary?.diabetes_risk,
    summary?.hypertension_risk,
    summary?.anemia_risk,
    summary?.cardiac_risk,
  ].filter(r => typeof r === 'number');

  const maxRisk = risks.length > 0 ? Math.max(...risks) : 0;

  if (maxRisk > 75) return 'critical';
  if (maxRisk > 50) return 'high';
  if (maxRisk > 25) return 'moderate';
  return 'low';
};

// --- POST /api/appointments/book ---
export const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, requestedTime, notes } = req.body;

    // Basic presence check
    if (!patientId || !doctorId || !requestedTime) {
      return res.status(400).json({ message: 'Missing patientId, doctorId, or requestedTime.' });
    }

    // Validate ObjectId formats
    if (!mongoose.isValidObjectId(patientId) || !mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: 'Invalid patientId or doctorId format.' });
    }

    // Parse and validate requested time
    const parsedRequestedAt = new Date(requestedTime);
    if (Number.isNaN(parsedRequestedAt.getTime())) {
      return res.status(400).json({ message: 'Invalid requestedTime. Please provide an ISO date string.' });
    }

    // Optional: ensure patient & doctor actually exist (fail fast)
    const [patient, doctor] = await Promise.all([
      User.findById(patientId).select('_id name').lean(),
      User.findById(doctorId).select('_id name role').lean(),
    ]);

    if (!patient) return res.status(404).json({ message: 'Patient not found.' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

    // 1. Fetch patient's current AI Summary for Triage Snapshot (non-fatal)
    let aiSummary = null;
    try {
      aiSummary = await AISummary.findOne({ patient: patientId }).lean();
    } catch (aiErr) {
      console.warn('[bookAppointment] AISummary lookup failed (non-fatal):', aiErr?.message || aiErr);
      aiSummary = null;
    }

    // 2. Build the risk snapshot
    const riskSnapshot = {
      risk_level: calculateRiskLevel(aiSummary),
      diabetes_risk: aiSummary?.diabetes_risk || 0,
      hypertension_risk: aiSummary?.hypertension_risk || 0,
      anemia_risk: aiSummary?.anemia_risk || 0,
      cardiac_risk: aiSummary?.cardiac_risk || 0,
    };

    // 3. Create the appointment (create with ObjectId instances)
    let newAppointment;
    try {
      newAppointment = await Appointment.create({
        patient: new mongoose.Types.ObjectId(patientId),
        doctor: new mongoose.Types.ObjectId(doctorId),
        requested_at: parsedRequestedAt,
        risk_snapshot: riskSnapshot,
        notes,
        status: 'pending',
        createdAt: new Date(),
      });
    } catch (createErr) {
      // Handle common Mongoose errors with friendlier responses
      if (createErr.name === 'ValidationError') {
        const details = Object.keys(createErr.errors || {}).reduce((acc, k) => {
          acc[k] = createErr.errors[k].message;
          return acc;
        }, {});
        console.warn('[bookAppointment] ValidationError:', details);
        return res.status(400).json({ message: 'Invalid appointment data.', details });
      }
      if (createErr.name === 'CastError') {
        console.warn('[bookAppointment] CastError:', createErr.message);
        return res.status(400).json({ message: 'Invalid data format.' });
      }
      // otherwise rethrow to outer catch
      throw createErr;
    }

    // 4. Emit to the doctor's room so doctors online get new-appointment push
    try {
      const io = req.app.get('io');
      if (io) {
        const doctorRoom = `doctor:${String(doctorId)}`;
        io.to(doctorRoom).emit('appointment:new', {
          appointment: {
            _id: newAppointment._id,
            patient: newAppointment.patient,
            requested_at: newAppointment.requested_at,
            risk_snapshot: newAppointment.risk_snapshot,
            notes: newAppointment.notes,
            status: newAppointment.status,
          }
        });
      }
    } catch (emitErr) {
      console.warn('[bookAppointment] emit to doctor failed', emitErr);
    }

    // 5. Return a populated appointment so frontend receives doctor info immediately
    let populatedAppt = null;
    try {
      populatedAppt = await Appointment.findById(newAppointment._id)
        .populate({ path: 'doctor', select: 'name firstName lastName specialty' })
        .populate({ path: 'patient', select: 'name' })
        .lean();
    } catch (popErr) {
      console.warn('[bookAppointment] post-create populate failed (non-fatal):', popErr?.message || popErr);
      // fallback to the raw created doc
      populatedAppt = newAppointment;
    }

    return res.status(201).json({
      message: 'Appointment request sent successfully.',
      appointment: populatedAppt,
    });
  } catch (err) {
    // Structured logging for fast triage
    console.error('❌ [bookAppointment] Unhandled Error:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack?.split('\n')?.slice(0, 6).join('\n'),
    });

    if (err?.name === 'MongoNetworkError' || err?.message?.includes('ECONN')) {
      return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
    }

    return res.status(500).json({ message: 'Server error during appointment booking.' });
  }
};


// --- GET /api/appointments/doctor/appointments ---
export const getDoctorAppointmentQueue = async (req, res) => {
  try {
    const doctorId = req.user && req.user._id;
    if (!doctorId) return res.status(401).json({ message: 'Unauthorized' });

    const queue = await Appointment.find({
      doctor: doctorId,
      status: 'pending'
    })
      .populate('patient', 'name gender dob')
      .lean();

    // Manual sort by risk level (critical -> high -> moderate -> low -> unknown)
    const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0 };

    const sortedQueue = queue.sort((a, b) => {
      const ra = riskOrder[a?.risk_snapshot?.risk_level] ?? 0;
      const rb = riskOrder[b?.risk_snapshot?.risk_level] ?? 0;
      if (rb !== ra) return rb - ra;
      // fallback: earlier requested_at first
      return new Date(a.requested_at) - new Date(b.requested_at);
    });

    return res.json({ data: sortedQueue });
  } catch (err) {
    console.error('❌ [getDoctorAppointmentQueue] Error:', err);
    return res.status(500).json({ message: 'Server error retrieving appointment queue.' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actor = req.user;

    if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    if (!actor) return res.status(401).json({ message: 'Unauthorized' });

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    // Authorization: only assigned doctor or admin may change status
    if (String(appointment.doctor) !== String(actor._id) && actor.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not allowed to modify this appointment.' });
    }

    // Update fields
    appointment.status = status;
    if (status === 'confirmed') {
      appointment.confirmed_at = new Date();
    } else {
      appointment.confirmed_at = appointment.confirmed_at; // leave as-is or undefined
    }
    appointment.status_changed_at = new Date();

    await appointment.save();

    // Emit to the patient room (appointment update)
    try {
      const io = req.app.get('io');
      if (io && appointment.patient) {
        const patientIdForRoom = String(appointment.patient?._id ?? appointment.patient);
        const patientRoom = `patient:${patientIdForRoom}`;
        const payload = {
          appointment: {
            _id: appointment._id,
            status: appointment.status,
            requested_at: appointment.requested_at,
            status_changed_at: appointment.status_changed_at,
            doctor: appointment.doctor,
          }
        };
        io.to(patientRoom).emit('appointment:update', payload);
      }
    } catch (emitErr) {
      console.warn('[updateAppointmentStatus] emit to patient failed', emitErr);
    }

    // Create notification with doctorName / specialty included (best-effort)
    try {
      // Resolve doctor's display name (try populated object first, then DB lookup)
      let doctorName = null;
      let doctorSpecialty = null;

      try {
        // appointment.doctor might be populated object or an ObjectId
        if (appointment.doctor && typeof appointment.doctor === 'object' && (appointment.doctor.name || appointment.doctor.firstName || appointment.doctor.lastName)) {
          // wrap nullish expression before using || to satisfy parser
          doctorName = (appointment.doctor.name ?? `${appointment.doctor.firstName ?? ''} ${appointment.doctor.lastName ?? ''}`.trim()) || null;
          doctorSpecialty = appointment.doctor.specialty ?? appointment.doctor.specialization ?? null;
        } else if (appointment.doctor) {
          // DB lookup (non-fatal)
          const docUser = await User.findById(appointment.doctor).select('name firstName lastName specialty role').lean();
          if (docUser) {
            doctorName = (docUser.name ?? `${docUser.firstName ?? ''} ${docUser.lastName ?? ''}`.trim()) || null;
            doctorSpecialty = docUser.specialty ?? docUser.specialization ?? null;
          }
        }
      } catch (lookupErr) {
        console.warn('[updateAppointmentStatus] doctor lookup non-fatal error', lookupErr?.message ?? lookupErr);
      }

      const notifPayload = {
        patientId: appointment.patient,
        appointmentId: appointment._id,
        type: 'appointment_status',
        title: `Appointment ${status}`,
        body: `Your appointment scheduled for ${new Date(appointment.requested_at).toLocaleString()} has been ${status}.`,
        meta: { status, appointmentId: appointment._id, doctorId: appointment.doctor },
        // convenience fields for the client
        doctorName: doctorName ?? null,
        doctorSpecialty: doctorSpecialty ?? null,
      };

      const notif = await Notification.create(notifPayload);

      // Emit notification to patient room
      try {
        const patientId = String(appointment.patient?._id ?? appointment.patient);
        const notifObj = notif?.toObject ? notif.toObject() : notif;
        const io = req.app.get('io');
        if (io) {
          io.to(`patient:${patientId}`).emit('notification:new', { notification: notifObj });
        }
      } catch (emitNotifErr) {
        console.warn('[updateAppointmentStatus] emit notification failed', emitNotifErr);
      }
    } catch (nErr) {
      console.warn('[updateAppointmentStatus] could not persist notification', nErr);
    }

    // Return the updated appointment (safe subset)
    const publicAppt = {
      _id: appointment._id,
      status: appointment.status,
      requested_at: appointment.requested_at,
      status_changed_at: appointment.status_changed_at,
      doctor: appointment.doctor,
      patient: appointment.patient,
    };

    return res.json({ message: `Appointment status updated to ${status}.`, appointment: publicAppt });
  } catch (err) {
    console.error('❌ [updateAppointmentStatus] Error:', err);
    return res.status(500).json({ message: 'Server error updating appointment status.' });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    // populate doctor (and optionally patient)
    const appt = await Appointment.findById(id)
      .populate({ path: 'doctor', select: 'name firstName lastName specialty' })
      .populate({ path: 'patient', select: 'name' })
      .lean();

    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization: only the patient who owns it, the assigned doctor, or admin can fetch
    const caller = req.user;
    if (!caller) return res.status(401).json({ message: 'Unauthorized' });

    const callerIdStr = String(caller._id);
    const apptPatientStr = String(appt.patient?._id ?? appt.patient);
    const apptDoctorStr = String(appt.doctor?._id ?? appt.doctor);

    if (caller.role !== 'admin' && callerIdStr !== apptPatientStr && callerIdStr !== apptDoctorStr) {
      return res.status(403).json({ message: 'Forbidden: not allowed to view this appointment' });
    }

    return res.json({ data: appt });
  } catch (err) {
    console.error('[getAppointmentById] Error:', err);
    return res.status(500).json({ message: 'Server error fetching appointment' });
  }
};
