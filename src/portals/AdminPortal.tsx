import { useState } from 'react';
import { BarChart3, Users, AlertTriangle, TrendingUp, Download, Calendar, MapPin } from 'lucide-react';
import { mockAnalyticsData } from '../lib/mockData';

export default function AdminPortal() {
  const [dateRange, setDateRange] = useState('last-6-months');
  const [reportType, setReportType] = useState('summary');

  const handleExportReport = () => {
    alert('Exporting report... This would generate a downloadable file.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">Government Health Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Ministry of Health</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Health Overview</h2>
          <p className="text-gray-600">Real-time health analytics and trends across all regions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {mockAnalyticsData.totalPatients.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Patients</div>
            <div className="text-xs text-green-600 mt-2">
              +{mockAnalyticsData.totalPatients - mockAnalyticsData.monthlyTrends[0].patients} this period
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-600" />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {mockAnalyticsData.activePatients.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Active Patients</div>
            <div className="text-xs text-gray-500 mt-2">
              {((mockAnalyticsData.activePatients / mockAnalyticsData.totalPatients) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {mockAnalyticsData.highRiskPatients}
            </div>
            <div className="text-sm text-gray-600">High Risk Patients</div>
            <div className="text-xs text-orange-600 mt-2">
              {((mockAnalyticsData.highRiskPatients / mockAnalyticsData.totalPatients) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {mockAnalyticsData.criticalAlerts}
            </div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
            <div className="text-xs text-red-600 mt-2">Requires immediate attention</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient & Visit Trends</h3>
            <div className="space-y-4">
              {mockAnalyticsData.monthlyTrends.map((month) => (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-blue-600 font-medium">{month.patients} patients</span>
                      <span className="text-sm text-green-600 font-medium">{month.visits} visits</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                      style={{ width: `${(month.patients / mockAnalyticsData.totalPatients) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Prevalence</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Hypertension</span>
                  <span className="text-sm font-semibold text-red-600">
                    {mockAnalyticsData.hypertensionPrevalence}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                    style={{ width: `${mockAnalyticsData.hypertensionPrevalence}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Anemia</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {mockAnalyticsData.anemiaPrevalence}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                    style={{ width: `${mockAnalyticsData.anemiaPrevalence}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Diabetes</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {mockAnalyticsData.diabetesPrevalence}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                    style={{ width: `${mockAnalyticsData.diabetesPrevalence}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">
                  Prevalence rates calculated from diagnosed cases within the active patient population.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Regional Distribution</h3>
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.regionData.map((region) => (
                <div key={region.region} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{region.region}</h4>
                    <span className="text-sm text-red-600 font-medium">{region.highRisk} high risk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{region.patients} patients</span>
                    <span className="text-xs text-gray-500">
                      {((region.highRisk / region.patients) * 100).toFixed(1)}% high risk
                    </span>
                  </div>
                  <div className="mt-2 relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-green-600 rounded-full"
                      style={{ width: `${(region.patients / mockAnalyticsData.totalPatients) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
            <div className="space-y-3">
              {mockAnalyticsData.ageDistribution.map((age) => (
                <div key={age.ageGroup} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">{age.ageGroup}</div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-3"
                        style={{ width: `${(age.count / mockAnalyticsData.totalPatients) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{age.count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {((age.count / mockAnalyticsData.totalPatients) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                onClick={handleExportReport}
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
                  Reports can be exported as PDF, Excel, or CSV formats. All reports include
                  detailed analytics, visualizations, and compliance with health data standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
