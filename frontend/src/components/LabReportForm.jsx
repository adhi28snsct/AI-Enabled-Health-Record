import React from 'react';
import { X, FlaskConical } from 'lucide-react';

// Define all the necessary lab fields and their default units/ranges
const LAB_FIELDS = [
    { key: 'Glucose', label: 'Glucose', unit: 'mg/dL', range: '70-100' },
    { key: 'Hemoglobin', label: 'Hemoglobin (Hb)', unit: 'g/dL', range: '12-16' },
    { key: 'Hematocrit', label: 'Hematocrit (Hct)', unit: '%', range: '36-48' },
];

const LabReportForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
    
    // Handler for changes to the nested 'results' object
    const handleResultChange = (testKey, field, value) => {
        setFormData(prev => ({
            ...prev,
            results: {
                ...prev.results,
                // Ensure the range and unit are saved with the value/status for persistence
                [testKey]: {
                    ...prev.results[testKey],
                    [field]: value
                }
            }
        }));
    };

    // Helper to get nested value safely
    const getResultValue = (testKey, field) => formData.results?.[testKey]?.[field] || '';
    
    // Handler for general input changes (e.g., test_name, notes)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form
            onSubmit={onSubmit}
            className="mb-6 p-4 bg-purple-50 rounded-lg space-y-4"
            aria-label="Lab Report Form"
        >
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" /> {isEditing ? 'Edit Existing Report' : 'New Lab Report'}
                </h4>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* General Report Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="test_name" type="text" placeholder="Test Name (e.g., CMP, CBC)" required 
                       value={formData.test_name || ''} 
                       onChange={handleInputChange} 
                       className="p-3 border rounded-lg" />
                
                <input name="test_type" type="text" placeholder="Test Type (e.g., Blood Test, Imaging)" required
                       value={formData.test_type || ''} 
                       onChange={handleInputChange} 
                       className="p-3 border rounded-lg" />
            </div>

            {/* Results Input: Dynamic Loop for key lab fields */}
            <h5 className="text-sm font-medium text-gray-700 pt-2">Critical Test Results</h5>
            
            {LAB_FIELDS.map(({ key, label, unit, range }) => (
                <div key={key} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                    <h6 className="text-sm font-semibold text-gray-800">{label} ({unit})</h6>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Value Input */}
                        <input type="number" placeholder={`Value (${range})`} required
                               value={getResultValue(key, 'value')}
                               onChange={(e) => {
                                   // Also save unit and range when value changes to ensure data completeness
                                   handleResultChange(key, 'value', e.target.value);
                                   handleResultChange(key, 'unit', unit);
                                   handleResultChange(key, 'range', range);
                               }}
                               className="p-2 border rounded-lg" />
                        
                        {/* Status Select */}
                        <select value={getResultValue(key, 'status') || ''}
                                onChange={(e) => handleResultChange(key, 'status', e.target.value)}
                                className="p-2 border rounded-lg col-span-2">
                            <option value="">Select Status</option>
                            <option value="normal">Normal ({range})</option>
                            <option value="high">High</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            ))}
            
            <textarea name="notes" placeholder="Clinician Notes on Report" rows={2} 
                      value={formData.notes || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-3 border rounded-lg" />

            <button type="submit" className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
                {isEditing ? 'Update Report' : 'Save New Report'}
            </button>
        </form>
    );
};

export default LabReportForm;