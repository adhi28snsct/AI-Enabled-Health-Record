import { X } from 'lucide-react';

const PrescriptionForm = ({ formData, setFormData, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-gray-900">New Prescription</h4>
      <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['medication', 'dosage', 'frequency', 'duration'].map((field) => (
        <input
          key={field}
          type="text"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          required
          value={formData[field]}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
    <textarea
      placeholder="Notes"
      value={formData.notes}
      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      rows={2}
    />
    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
      Save Prescription
    </button>
  </form>
);

export default PrescriptionForm;