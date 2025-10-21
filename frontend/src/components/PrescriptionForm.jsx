import { X } from 'lucide-react';

const PrescriptionForm = ({ formData, setFormData, onSubmit, onCancel }) => {
  const fields = [
    { name: 'medication_name', label: 'Medication Name' },
    { name: 'dosage', label: 'Dosage' },
    { name: 'frequency', label: 'Frequency' },
    { name: 'duration', label: 'Duration' },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4"
      aria-label="Prescription Form"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">New Prescription</h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Cancel Prescription"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ name, label }) => (
          <input
            key={name}
            name={name}
            type="text"
            placeholder={label}
            required
            value={formData[name] || ''}
            onChange={(e) =>
              setFormData({ ...formData, [name]: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label={label}
          />
        ))}
      </div>

      {/* Notes */}
      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes || ''}
        onChange={(e) =>
          setFormData({ ...formData, notes: e.target.value })
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        rows={2}
        aria-label="Prescription Notes"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Save Prescription
      </button>
    </form>
  );
};

export default PrescriptionForm;