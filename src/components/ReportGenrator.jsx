import { Download, Calendar } from 'lucide-react';

const ReportGenerator = ({ reportType, setReportType, dateRange, setDateRange, onExport }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Download className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="summary">Health Summary</option>
            <option value="disease">Disease Prevalence</option>
            <option value="regional">Regional Analysis</option>
            <option value="demographic">Demographic Breakdown</option>
            <option value="trends">Trend Analysis</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Available Report Formats</h4>
            <p className="text-sm text-gray-700">
              Reports can be exported as PDF, Excel, or CSV formats. All reports include detailed analytics, visualizations, and compliance with health data standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;