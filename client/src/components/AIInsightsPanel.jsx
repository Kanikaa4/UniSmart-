import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, AlertTriangle, UserCheck } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AIInsightsPanel({ token, API_BASE_URL, reloadTrigger }) {
  const [forecast, setForecast] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [riskStats, setRiskStats] = useState({ low: 0, med: 0, high: 0 });

  const headers = { Authorization: `Bearer ${token}` };

  const loadInsights = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/faculty/ai-insights`, { headers });
      const { forecast: foreData, atRiskStudents } = response.data;
      
      setForecast(foreData);
      setAtRisk(atRiskStudents);

      // Compute statistics count for risk categorizations
      let low = 0, med = 0, high = 0;
      // All students not in high/med risk are considered low risk
      // Fetch total students to get overall distributions
      const studRes = await axios.get(`${API_BASE_URL}/faculty/students`, { headers });
      const totalStudents = studRes.data.students;

      totalStudents.forEach(s => {
        if (s.attendance >= 80) low++;
        else if (s.attendance >= 70) med++;
        else high++;
      });
      setRiskStats({ low, med, high });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [reloadTrigger]);

  const lineChartData = forecast ? {
    labels: forecast.labels,
    datasets: [
      {
        label: 'Logged Attendance (%)',
        data: forecast.actualTrend,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 3
      },
      {
        label: 'AI Forecasted Attendance (%)',
        data: forecast.forecastTrend,
        borderColor: '#14b8a6',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#14b8a6'
      }
    ]
  } : null;

  const barChartData = {
    labels: ['Low Risk (>=80%)', 'Medium Risk (70-79%)', 'High Risk (<70%)'],
    datasets: [{
      label: 'Student Count',
      data: [riskStats.low, riskStats.med, riskStats.high],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    },
    scales: {
      y: {
        min: 40,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 9 } }
      },
      x: {
        grid: { color: 'transparent' },
        ticks: { color: '#94a3b8', font: { size: 9 } }
      }
    }
  };

  const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 9 }, stepSize: 1 }
      },
      y: {
        grid: { color: 'transparent' },
        ticks: { color: '#94a3b8', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-tab-slide">
      
      {/* Dynamic Charting panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart: Forecast */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit size={16} className="text-primaryIndigo" />
            <span>Attendance Trend & 7-Day Forecast</span>
          </h3>
          <div className="h-60 w-full relative">
            {lineChartData ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-textMuted">Compiling neural network parameters...</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Distributions */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} className="text-warningGold" />
            <span>Roster Risk Classification Metrics</span>
          </h3>
          <div className="h-60 w-full relative">
            <Bar data={barChartData} options={horizontalBarOptions} />
          </div>
        </div>

      </div>

      {/* Risk intervention table list */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-6 border-b border-glassBorder pb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-secondaryTeal" />
          <span>High-Risk Interventions Scheduled</span>
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-textSecondary uppercase tracking-wider border-b border-glassBorder">
                <th className="py-3 px-4 font-bold">Student</th>
                <th className="py-3 px-4 font-bold">Roll Number</th>
                <th className="py-3 px-4 font-bold">Current Att.</th>
                <th className="py-3 px-4 font-bold">Predicted Absenteeism</th>
                <th className="py-3 px-4 font-bold">Trigger Clause</th>
                <th className="py-3 px-4 font-bold">Action Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((student) => {
                const isHigh = student.dropProbability >= 60;
                const isMed = student.dropProbability >= 40;
                
                return (
                  <tr key={student._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{student.name}</td>
                    <td className="py-3.5 px-4 text-textSecondary">{student.rollNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{student.attendance}%</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold min-w-[28px]">{student.dropProbability}%</span>
                        <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${isHigh ? 'bg-dangerRed' : isMed ? 'bg-warningGold' : 'bg-successGreen'}`}
                            style={{ width: `${student.dropProbability}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-textSecondary">{student.triggerCause}</td>
                    <td className="py-3.5 px-4 text-textSecondary italic">{student.recommendation}</td>
                  </tr>
                );
              })}
              {atRisk.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-textMuted">No students require interventions currently. All records satisfy margins.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
