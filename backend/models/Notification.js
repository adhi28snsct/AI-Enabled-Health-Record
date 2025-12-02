import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },

  doctorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  doctorName: { type: String, default: null },
  doctorSpecialty: { type: String, default: null },

  type: { type: String, default: 'appointment_status' },
  title: { type: String },
  body: { type: String },

  meta: { type: Schema.Types.Mixed, default: {} },

  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.set('strict', false);

export default mongoose.model('Notification', NotificationSchema);
