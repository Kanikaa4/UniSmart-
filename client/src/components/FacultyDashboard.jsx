import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, FileDown, CheckCircle, Save, BookOpen, TrendingUp, Trophy, Percent } from 'lucide-react';
import axios from 'axios';
import playSound from './AudioService';

export default function FacultyDashboard({ token, API_BASE_URL, addNotif, triggerReloadAi, user, mode = 'attendance' }) {
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState({}); // YYYY-MM-DD -> { studentId -> P/A }
  const [marks, setMarks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [tempMarks, setTempMarks] = useState({}); // studentId -> marks
  
  // Date states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(6); // July (0-indexed)
  const [filter, setFilter] = useState('all');

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      // 1. Fetch Students
      const studRes = await axios.get(`${API_BASE_URL}/faculty/students`, { headers });
      setStudents(studRes.data.students);

      // 2. Fetch Logs
      const logsRes = await axios.get(`${API_BASE_URL}/faculty/attendance`, { headers });
      setLogs(logsRes.data.logs);

      // 3. Fetch Marks
      const marksRes = await axios.get(`${API_BASE_URL}/faculty/marks`, { headers });
      setMarks(marksRes.data.marks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, mode]);

  useEffect(() => {
    if (user && user.subjects && user.subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(user.subjects[0]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject && marks && students.length > 0) {
      const subjectMarks = {};
      students.forEach(s => {
        const record = marks.find(m => m.studentId === s._id && m.subject === selectedSubject);
        subjectMarks[s._id] = record ? record.marks : '';
      });
      setTempMarks(subjectMarks);
    }
  }, [selectedSubject, marks, students]);

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      alert("Please select a subject first.");
      return;
    }
    const records = Object.entries(tempMarks).map(([studentId, score]) => ({
      studentId,
      marks: score === '' ? 0 : Number(score),
      maxMarks: 100
    }));

    try {
      await axios.post(`${API_BASE_URL}/faculty/marks`, {
        subject: selectedSubject,
        records
      }, { headers });

      playSound('success');
      addNotif('Marks Uploaded', `Student scores successfully updated for ${selectedSubject}.`);
      
      // Reload marks
      const marksRes = await axios.get(`${API_BASE_URL}/faculty/marks`, { headers });
      setMarks(marksRes.data.marks || []);
    } catch (err) {
      playSound('alert');
      alert('Failed to save student marks.');
    }
  };

  // Gradebook Stats
  const subjectScores = Object.values(tempMarks)
    .filter(val => val !== '' && !isNaN(val))
    .map(Number);
  const subjectAvg = subjectScores.length > 0 ? (subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length).toFixed(1) : 'N/A';
  const subjectMax = subjectScores.length > 0 ? Math.max(...subjectScores) : 'N/A';
  const passCount = subjectScores.filter(s => s >= 40).length;
  const passRate = subjectScores.length > 0 ? ((passCount / subjectScores.length) * 100).toFixed(1) + '%' : 'N/A';

  // Recalculate stats based on state values
  const totalRosterCount = students.length;
  const atRiskCount = students.filter(s => s.attendance < 75).length;
  const overallSum = students.reduce((acc, curr) => acc + curr.attendance, 0);
  const overallAvg = totalRosterCount > 0 ? (overallSum / totalRosterCount).toFixed(1) : '100.0';

  // Calendar rendering
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => {
    setCalMonth(prev => {
      if (prev === 0) {
        setCalYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalMonth(prev => {
      if (prev === 11) {
        setCalYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const getDaysArray = () => {
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

    const arr = [];
    // Padding days
    for (let i = firstDayIndex; i > 0; i--) {
      arr.push({ day: prevMonthDays - i + 1, isCurrentMonth: false });
    }
    // Month days
    for (let d = 1; d <= totalDays; d++) {
      arr.push({ day: d, isCurrentMonth: true });
    }
    return arr;
  };

  const daysGrid = getDaysArray();

  const handleSelectDay = (dayObj) => {
    if (!dayObj.isCurrentMonth) return;
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleLogAttendance = async (studentId, status) => {
    const currentDayLogs = { ...(logs[selectedDate] || {}) };
    
    // Toggle
    if (currentDayLogs[studentId] === status) {
      delete currentDayLogs[studentId];
    } else {
      currentDayLogs[studentId] = status;
    }

    // Save to server
    const records = Object.entries(currentDayLogs).map(([sId, stat]) => ({ studentId: sId, status: stat }));
    
    try {
      await axios.post(`${API_BASE_URL}/faculty/attendance`, { date: selectedDate, records }, { headers });
      
      // Update local state directly for speedy UX
      const newLogs = { ...logs, [selectedDate]: currentDayLogs };
      setLogs(newLogs);
      playSound('success');
      
      // Reload Student averages
      const studRes = await axios.get(`${API_BASE_URL}/faculty/students`, { headers });
      setStudents(studRes.data.students);
      if (triggerReloadAi) triggerReloadAi(); // Reload Chart views

    } catch (err) {
      playSound('alert');
      alert('Failed to log attendance record.');
    }
  };

  const handleBatchLog = async (status) => {
    const records = students.map(s => ({ studentId: s._id, status }));
    try {
      await axios.post(`${API_BASE_URL}/faculty/attendance`, { date: selectedDate, records }, { headers });
      
      const dayLogs = {};
      students.forEach(s => dayLogs[s._id] = status);
      setLogs({ ...logs, [selectedDate]: dayLogs });
      
      playSound('success');
      const studRes = await axios.get(`${API_BASE_URL}/faculty/students`, { headers });
      setStudents(studRes.data.students);
      if (triggerReloadAi) triggerReloadAi();
    } catch (err) {
      alert('Failed to record batch logs.');
    }
  };

  const handleExportCSV = () => {
    let csv = "Student Name,Roll Number,Attendance Percentage,Eligibility Status\n";
    students.forEach(s => {
      const eligibility = s.attendance >= 75 ? "ELIGIBLE" : "AT RISK";
      csv += `"${s.name}","${s.rollNumber}",${s.attendance}%,${eligibility}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSound('success');
    addNotif('Report Exported', `CSV spreadsheet generated for ${selectedDate}.`);
  };

  const activeDayLog = logs[selectedDate] || {};

  const filteredStudents = students.filter(s => {
    const status = activeDayLog[s._id] || 'unlogged';
    if (filter === 'all') return true;
    if (filter === 'present') return status === 'P';
    return status === 'A';
  });

  if (mode === 'attendance') {
    return (
      <div className="flex flex-col gap-8 animate-tab-slide">
        {/* Faculty Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
            <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Class Average Attendance</h3>
              <div className="text-2xl font-extrabold mt-1">{overallAvg}%</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
            <div className="flex items-center justify-center w-12 h-12 bg-dangerRed/10 text-dangerRed rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">At-Risk Students (&lt;75%)</h3>
              <div className="text-2xl font-extrabold mt-1 text-dangerRed">{atRiskCount}</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
            <div className="flex items-center justify-center w-12 h-12 bg-secondaryTeal/10 text-secondaryTeal rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">AI Forecast Index</h3>
              <div className="text-2xl font-extrabold mt-1 text-secondaryTeal">{(parseFloat(overallAvg) + 2.5).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Logger Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Monthly Calendar View */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                <CalendarIcon size={18} className="text-primaryIndigo" />
                <span>Roster Calendar</span>
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={handlePrevMonth} className="p-1 rounded bg-white/5 border border-glassBorder text-textSecondary hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-white min-w-[76px] text-center">{monthNames[calMonth]} {calYear}</span>
                <button onClick={handleNextMonth} className="p-1 rounded bg-white/5 border border-glassBorder text-textSecondary hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center font-bold text-textSecondary text-[10px] uppercase mb-4 tracking-wider">
              {weekdays.map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {daysGrid.map((item, idx) => {
                const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const hasRecords = !!logs[dateKey];
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectDay(item)}
                    disabled={!item.isCurrentMonth}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold relative transition-all ${
                      !item.isCurrentMonth 
                        ? 'text-textMuted opacity-25 cursor-default' 
                        : isSelected
                          ? 'bg-primaryIndigo/20 border border-primaryIndigo text-primaryIndigo font-bold shadow-glow'
                          : 'bg-white/[0.01] hover:bg-white/[0.05] text-textSecondary'
                    }`}
                  >
                    <span>{item.day}</span>
                    {hasRecords && !isSelected && (
                      <span className="w-1.5 h-1.5 bg-secondaryTeal rounded-full absolute bottom-1 shadow-[0_0_4px_#14b8a6]"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-around border-t border-glassBorder mt-6 pt-4 text-[10px] text-textSecondary">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primaryIndigo shadow-[0_0_4px_#6366f1]"></span>Active Date</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondaryTeal shadow-[0_0_4px_#14b8a6]"></span>Logged</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-glassBorder"></span>Unscheduled</span>
            </div>
          </div>

          {/* Attendance Logger details */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4 mb-6 border-b border-glassBorder pb-4">
                <div>
                  <h2 className="text-sm font-extrabold text-white">Roster Logger: {selectedDate}</h2>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    {Object.keys(activeDayLog).length === 0 
                      ? 'Records empty. Log student marks below.' 
                      : `Logs active: ${Object.values(activeDayLog).filter(s => s === 'P').length} Present / ${Object.values(activeDayLog).filter(s => s === 'A').length} Absent`
                    }
                  </p>
                </div>
                <button onClick={handleExportCSV} className="bg-white/5 border border-glassBorder text-xs text-textSecondary hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                  <FileDown size={14} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Filter buttons */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex gap-2">
                  {['all', 'present', 'absent'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilter(mode)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold capitalize transition-colors ${
                        filter === mode 
                          ? 'bg-primaryIndigo text-white' 
                          : 'bg-white/[0.02] border border-glassBorder text-textSecondary hover:bg-white/[0.05]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2 text-[10px] font-semibold text-textMuted">
                  <button onClick={() => handleBatchLog('P')} className="hover:text-primaryIndigo underline">All Present</button>
                  <span>/</span>
                  <button onClick={() => handleBatchLog('A')} className="hover:text-primaryIndigo underline">All Absent</button>
                </div>
              </div>

              {/* Student Logger List */}
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredStudents.map((s) => {
                  const status = activeDayLog[s._id] || 'unlogged';
                  return (
                    <div key={s._id} className="bg-white/[0.01] border border-glassBorder rounded-xl p-3.5 flex justify-between items-center hover:border-textMuted transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-white">{s.name}</h4>
                        <p className="text-[10px] text-textSecondary mt-0.5">{s.rollNumber} &bull; Overall: {s.attendance}%</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLogAttendance(s._id, 'P')}
                          className={`w-9 h-7 text-[10px] font-bold rounded-lg border transition-all ${
                            status === 'P'
                              ? 'bg-successGreenBg text-successGreen border-successGreen'
                              : 'bg-transparent border-glassBorder text-textSecondary hover:bg-white/5'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleLogAttendance(s._id, 'A')}
                          className={`w-9 h-7 text-[10px] font-bold rounded-lg border transition-all ${
                            status === 'A'
                              ? 'bg-dangerRedBg text-dangerRed border-dangerRed'
                              : 'bg-transparent border-glassBorder text-textSecondary hover:bg-white/5'
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-textMuted text-xs">No students matching active logger filter.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Render Gradebook UI
  return (
    <div className="flex flex-col gap-8 animate-tab-slide">
      {/* Gradebook Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Subject Average</h3>
            <div className="text-2xl font-extrabold mt-1">{subjectAvg}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="flex items-center justify-center w-12 h-12 bg-secondaryTeal/10 text-secondaryTeal rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Highest Score</h3>
            <div className="text-2xl font-extrabold mt-1 text-secondaryTeal">{subjectMax}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="flex items-center justify-center w-12 h-12 bg-accentPurple/10 text-accentPurple rounded-xl">
            <Percent size={24} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Pass Rate (&gt;=40%)</h3>
            <div className="text-2xl font-extrabold mt-1 text-accentPurple">{passRate}</div>
          </div>
        </div>
      </div>

      {/* Main Gradebook Panel */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-glassBorder pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <BookOpen className="text-primaryIndigo" size={20} />
              <span>Academic Gradebook</span>
            </h2>
            <p className="text-[11px] text-textSecondary mt-0.5">Input and sync student scores instantly into the database.</p>
          </div>
          
          <div className="flex flex-col gap-1.5 w-full md:w-64">
            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Active Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-bgbase border border-glassBorder focus:border-primaryIndigo rounded-lg text-xs text-white focus:outline-none transition-all font-semibold"
            >
              {user && user.subjects && user.subjects.length > 0 ? (
                user.subjects.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))
              ) : (
                <option value="">No Subjects Assigned</option>
              )}
            </select>
          </div>
        </div>

        {user && user.subjects && user.subjects.length > 0 ? (
          <form onSubmit={handleSaveMarks} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
              {students.map((student) => (
                <div key={student._id} className="bg-white/[0.01] border border-glassBorder rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-textMuted transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-white">{student.name}</h4>
                    <p className="text-xs text-textSecondary mt-0.5">{student.rollNumber} &bull; Batch {student.batch}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tempMarks[student._id] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempMarks(prev => ({
                          ...prev,
                          [student._id]: val === '' ? '' : Math.min(100, Math.max(0, Number(val)))
                        }));
                      }}
                      placeholder="--"
                      className="w-20 px-3 py-1.5 bg-white/[0.03] border border-glassBorder focus:border-primaryIndigo rounded-lg text-center text-sm text-white focus:outline-none transition-all font-bold"
                    />
                    <span className="text-xs font-semibold text-textSecondary">/ 100</span>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-8 text-textMuted text-xs">No students registered under your instructor profile.</div>
              )}
            </div>

            <button
              type="submit"
              disabled={students.length === 0}
              className="w-full sm:w-auto self-end bg-primaryIndigo hover:bg-indigo-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-glow"
            >
              <Save size={16} />
              <span>Save & Publish Grades</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-12 bg-white/[0.01] border border-dashed border-glassBorder rounded-xl">
            <BookOpen className="w-12 h-12 text-textMuted mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Assigned Subjects</h3>
            <p className="text-xs text-textSecondary max-w-sm mx-auto">You cannot enter student marks until the administrator assigns subjects to your faculty profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
