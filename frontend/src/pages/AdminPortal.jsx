import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  Download,
  Calendar,
  MapPin,
} from 'lucide-react';

import StatCard from '../components/StatCard';
import TrendBar from '../components/TrendBar';
import DiseaseBar from '../components/DiseaseBar';
import RegionCard from '../components/RegionCard';
import AgeBar from '../components/AgeBar';
import ReportGenerator from '../components/ReportGenrator';

import { mockAnalyticsData } from '../lib/mockData';

export default function AdminPortal() {
  const [dateRange, setDateRange] = useState('last-6-months');
  const [reportType, setReportType] = useState('summary');

  const handleExportReport = () => {
    alert('Exporting report... This would generate a downloadable file.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">Government Health Analytics</h1>
            </div>
            <span className="text-sm text-gray-600">Ministry of Health</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Health Overview</h2>
          <p className="text-gray-600">Real-time health analytics and trends across all regions</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={mockAnalyticsData.totalPatients.toLocaleString()}
            icon={Users}
            color="blue"
            subtext={`+${mockAnalyticsData.totalPatients - mockAnalyticsData.monthlyTrends[0].patients} this period`}
          />
          <StatCard
            title="Active Patients"
            value={mockAnalyticsData.activePatients.toLocaleString()}
            icon={Users}
            color="green"
            delta={`${((mockAnalyticsData.activePatients / mockAnalyticsData.totalPatients) * 100).toFixed(1)}% of total`}
          />
          <StatCard
            title="High Risk Patients"
            value={mockAnalyticsData.highRiskPatients}
            icon={AlertTriangle}
            color="orange"
            subtext={`${((mockAnalyticsData.highRiskPatients / mockAnalyticsData.totalPatients) * 100).toFixed(1)}% of total`}
          />
          <StatCard
            title="Critical Alerts"
            value={mockAnalyticsData.criticalAlerts}
            icon={AlertTriangle}
            color="red"
            subtext="Requires immediate attention"
          />
        </div>

        {/* Trends & Disease Prevalence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patient Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient & Visit Trends</h3>
            <div className="space-y-4">
              {mockAnalyticsData.monthlyTrends.map((month) => (
                <TrendBar
                  key={month.month}
                  month={month.month}
                  patients={month.patients}
                  visits={month.visits}
                  total={mockAnalyticsData.totalPatients}
                />
              ))}
            </div>
          </div>

          {/* Disease Prevalence */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Prevalence</h3>
            <div className="space-y-4">
              {[
                { name: 'Hypertension', color: 'red', value: mockAnalyticsData.hypertensionPrevalence },
                { name: 'Anemia', color: 'orange', value: mockAnalyticsData.anemiaPrevalence },
                { name: 'Diabetes', color: 'yellow', value: mockAnalyticsData.diabetesPrevalence },
              ].map((disease) => (
                <DiseaseBar
                  key={disease.name}
                  name={disease.name}
                  value={disease.value}
                  color={disease.color}
                />
              ))}
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-600">
                Prevalence rates calculated from diagnosed cases within the active patient population.
              </p>
            </div>
          </div>
        </div>

        {/* Region & Age Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Regional Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Regional Distribution</h3>
            </div>
            <div className="space-y-4">
              {mockAnalyticsData.regionData.map((region) => (
                <RegionCard
                  key={region.region}
                  region={region.region}
                  patients={region.patients}
                  highRisk={region.highRisk}
                  total={mockAnalyticsData.totalPatients}
                />
              ))}
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
            <div className="space-y-3">
              {mockAnalyticsData.ageDistribution.map((age) => (
                <AgeBar
                  key={age.ageGroup}
                  ageGroup={age.ageGroup}
                  count={age.count}
                  total={mockAnalyticsData.totalPatients}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Report Generator */}
        <ReportGenerator
          reportType={reportType}
          setReportType={setReportType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onExport={handleExportReport}
        />
      </main>
    </div>
  );
}