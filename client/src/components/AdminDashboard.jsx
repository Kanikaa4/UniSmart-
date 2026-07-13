import React, { useState, useEffect } from 'react';
import { Presentation, Users, Building, UserPlus, UploadCloud, Info, FileSpreadsheet, Search, CheckCircle } from 'lucide-react';
import axios from 'axios';
import playSound from './AudioService';

export default function AdminDashboard({ token, API_BASE_URL, onLogout, addNotif }) {
  const [faculty, setFaculty] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [search, setSearch] = useState('');
  
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facDept, setFacDept] = useState('Computer Science');
  const [facYear, setFacYear] = useState('2023-2024');
  const [facSubjects, setFacSubjects] = useState('');
  
  // Upload file state
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [dragover, setDragover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/faculty`, { headers });
      setFaculty(response.data.faculty);
      if (response.data.faculty.length > 0) {
        setSelectedFaculty(response.data.faculty[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/faculty`, {
        name: facName,
        email: facEmail,
        department: facDept,
        academicYear: facYear,
        subjects: facSubjects
      }, { headers });

      playSound('success');
      addNotif('Faculty Added', `${facName} registered inside ${facDept} department.`);
      
      // Reset
      setFacName('');
      setFacEmail('');
      setFacSubjects('');
      loadData();
    } catch (err) {
      playSound('alert');
      alert(err.response?.data?.error || 'Failed to create faculty profile.');
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    if (e.dataTransfer.files.length > 0) {
      uploadRoster(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      uploadRoster(e.target.files[0]);
    }
  };

  const uploadRoster = async (file) => {
    if (!selectedFaculty) {
      alert('Please select a faculty member first.');
      return;
    }
    setUploadFileName(file.name);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('facultyId', selectedFaculty);

    try {
      setUploadProgress(50);
      const response = await axios.post(`${API_BASE_URL}/admin/upload-students`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);
      playSound('success');
      addNotif('Database Synced', response.data.message);
      
      setTimeout(() => setUploadProgress(null), 1000);
    } catch (err) {
      setUploadProgress(null);
      playSound('alert');
      alert(err.response?.data?.error || 'Failed to upload student database.');
    }
  };

  const handleDownloadDemoCsv = () => {
    const csvContent = "Name,RollNumber,Email,Batch\nJohn Doe,CS-2026-011,john.doe@unismart.edu,2026\nBruce Wayne,CS-2026-012,bruce.wayne@unismart.edu,2026\nClark Kent,CS-2026-013,clark.kent@unismart.edu,2026";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unismart_student_roster.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.department.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-tab-slide">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="flex items-center justify-center w-12 h-12 bg-primaryIndigo/10 text-primaryIndigo rounded-xl">
            <Presentation size={24} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Active Faculty</h3>
            <div className="text-2xl font-extrabold mt-1">{faculty.length}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="flex items-center justify-center w-12 h-12 bg-secondaryTeal/10 text-secondaryTeal rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Department Rosters</h3>
            <div className="text-2xl font-extrabold mt-1">CS, EE, MATH, PHY</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
          <div className="flex items-center justify-center w-12 h-12 bg-accentPurple/10 text-accentPurple rounded-xl">
            <Building size={24} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">System Status</h3>
            <div className="text-sm font-bold text-successGreen mt-1 flex items-center gap-1">
              <CheckCircle size={14} />
              <span>Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Create Faculty Panel */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-white border-b border-glassBorder pb-3">
            <UserPlus className="text-primaryIndigo" size={20} />
            <span>Register New Faculty</span>
          </h2>
          <form onSubmit={handleCreateFaculty} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Full Name</label>
              <input
                type="text"
                value={facName}
                onChange={(e) => setFacName(e.target.value)}
                placeholder="Dr. Alan Turing"
                required
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-glassBorder focus:border-primaryIndigo rounded-lg text-sm text-white focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Department</label>
                <select
                  value={facDept}
                  onChange={(e) => setFacDept(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bgbase border border-glassBorder focus:border-primaryIndigo rounded-lg text-sm text-white focus:outline-none transition-all"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Academic Year</label>
                <select
                  value={facYear}
                  onChange={(e) => setFacYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bgbase border border-glassBorder focus:border-primaryIndigo rounded-lg text-sm text-white focus:outline-none transition-all"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Official Email</label>
              <input
                type="email"
                value={facEmail}
                onChange={(e) => setFacEmail(e.target.value)}
                placeholder="alan.turing@unismart.edu"
                required
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-glassBorder focus:border-primaryIndigo rounded-lg text-sm text-white focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Assigned Subjects (comma-separated)</label>
              <input
                type="text"
                value={facSubjects}
                onChange={(e) => setFacSubjects(e.target.value)}
                placeholder="Advanced Algorithms, Machine Learning"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-glassBorder focus:border-primaryIndigo rounded-lg text-sm text-white focus:outline-none transition-all"
              />
            </div>

            <button type="submit" className="w-full bg-primaryIndigo hover:bg-indigo-600 text-white font-bold py-3 rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 shadow-glow">
              Add Faculty Member
            </button>
          </form>
        </div>

        {/* Sync Student Database CSV Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-white border-b border-glassBorder pb-3">
              <UploadCloud className="text-primaryIndigo" size={20} />
              <span>Upload Student Database</span>
            </h2>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Select Assigned Faculty Registry</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bgbase border border-glassBorder focus:border-primaryIndigo rounded-lg text-sm text-white focus:outline-none transition-all"
                >
                  {faculty.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>

              {/* Drag/Drop Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('studentCsvInput').click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragover ? 'border-primaryIndigo bg-primaryIndigo/5' : 'border-glassBorder bg-white/[0.01] hover:border-textMuted'
                }`}
              >
                <FileSpreadsheet className={`w-12 h-12 mb-3 transition-colors ${dragover ? 'text-primaryIndigo' : 'text-textMuted'}`} />
                <h3 className="text-sm font-bold text-white mb-1">Drag & Drop student CSV here</h3>
                <p className="text-xs text-textSecondary">or click to select file from desktop</p>
                <input
                  type="file"
                  id="studentCsvInput"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Loader bar */}
          {uploadProgress !== null && (
            <div className="bg-white/2 border border-glassBorder p-4 rounded-lg animate-pulse-glow">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>{uploadFileName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primaryIndigo to-secondaryTeal h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <div className="bg-white/2 border border-glassBorder p-4 rounded-xl flex gap-3 items-start mt-4">
            <Info size={16} className="text-secondaryTeal mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-textSecondary leading-normal">
              Need a dummy dataset to test? <button onClick={handleDownloadDemoCsv} className="text-primaryIndigo underline font-semibold">Download template CSV roster</button> containing formatted student parameters.
            </div>
          </div>
        </div>

      </div>

      {/* Roster Live Faculty List */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-glassBorder pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Users className="text-primaryIndigo" size={20} />
            <span>Active Faculty Registry</span>
          </h2>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 text-textMuted top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty department or email..."
              className="w-full pl-9 pr-4 py-2 bg-white/[0.02] border border-glassBorder focus:border-primaryIndigo rounded-lg text-xs text-white focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-textSecondary uppercase tracking-wider border-b border-glassBorder">
                <th className="py-3.5 px-4 font-bold">Name</th>
                <th className="py-3.5 px-4 font-bold">Department</th>
                <th className="py-3.5 px-4 font-bold">Assigned Subjects</th>
                <th className="py-3.5 px-4 font-bold">University Email</th>
                <th className="py-3.5 px-4 font-bold">Academic Cycle</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((fac) => (
                <tr key={fac._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{fac.name}</td>
                  <td className="py-3.5 px-4 text-textSecondary">{fac.department}</td>
                  <td className="py-3.5 px-4 text-textSecondary">
                    <div className="flex flex-wrap gap-1">
                      {fac.subjects && fac.subjects.length > 0 ? (
                        fac.subjects.map((sub, i) => (
                          <span key={i} className="bg-white/5 border border-glassBorder text-[10px] px-2 py-0.5 rounded-md text-white font-medium">
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-textMuted italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-textSecondary">{fac.email}</td>
                  <td className="py-3.5 px-4 text-textSecondary">{fac.academicYear}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-successGreenBg text-successGreen border border-successGreen/25 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {fac.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-textMuted">No faculty members found mapping search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
