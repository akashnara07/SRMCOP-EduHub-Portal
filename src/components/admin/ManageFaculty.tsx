import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Search, Plus, Mail, Check, Trash2, Edit2, 
  Phone, Eye, Calendar, Building2, Briefcase, Award, X, Sparkles,
  CheckCircle2, Clock, BookOpen, ShieldAlert
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { 
  FacultyMember, 
  getFacultyMaster, 
  saveFacultyMaster,
  getFacultyTeachingHistory,
  TeachingAssignment
} from '../../data/facultyRegistry';

interface ManageFacultyProps {
  onBack: () => void;
}

const DEPARTMENTS = [
  'Department of Pharmacology',
  'Department of Pharmaceutical Analysis',
  'Department of Pharmacognosy',
  'Department of Pharmaceutics',
  'Department of Pharmacy Practice',
  'Department of Pharmaceutical Quality Assurance',
  'Department of Pharmaceutical Regulatory affairs',
  'Department of Pharmaceutical Chemistry'
];

const DESIGNATIONS = [
  'Professor & Dean',
  'Professor & Head',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Visiting Faculty'
];

export default function ManageFaculty({ onBack }: ManageFacultyProps) {
  // Master Faculty State
  const [faculty, setFaculty] = useState<FacultyMember[]>(() => getFacultyMaster());

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form State
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formDept, setFormDept] = useState('Department of Pharmacology');
  const [formDesignation, setFormDesignation] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'On Leave' | 'Retired'>('Active');
  const [formDateJoined, setFormDateJoined] = useState('');

  // View Profile Drawer State
  const [selectedFacultyProfile, setSelectedFacultyProfile] = useState<FacultyMember | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync Master Faculty to LocalStorage
  const handleSaveFaculty = (newList: FacultyMember[]) => {
    setFaculty(newList);
    saveFacultyMaster(newList);
  };

  // Handle Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmpId.trim() || !formEmail.trim()) {
      showToast('Please fill in all required faculty fields.');
      return;
    }

    // Duplicate check for Employee ID
    const duplicate = faculty.some(
      f => f.empId.toUpperCase() === formEmpId.toUpperCase().trim() && f.id !== editingFacultyId
    );
    if (duplicate) {
      alert(`A faculty member with Employee ID ${formEmpId} already exists.`);
      return;
    }

    const payload: FacultyMember = {
      id: editingFacultyId || `fac-${Date.now()}`,
      name: formName.trim(),
      empId: formEmpId.toUpperCase().trim(),
      dept: formDept,
      designation: formDesignation,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      status: formStatus,
      dateJoined: formDateJoined
    };

    if (editingFacultyId) {
      const updated = faculty.map(f => f.id === editingFacultyId ? payload : f);
      handleSaveFaculty(updated);
      showToast('Faculty master details updated successfully!');
      setEditingFacultyId(null);
    } else {
      const updated = [payload, ...faculty];
      handleSaveFaculty(updated);
      showToast('New faculty member registered successfully!');
    }

    setShowAddModal(false);
    resetForm();
  };

  const startEdit = (fac: FacultyMember) => {
    setEditingFacultyId(fac.id);
    setFormName(fac.name);
    setFormEmpId(fac.empId);
    setFormDept(fac.dept);
    setFormDesignation(fac.designation || '');
    setFormEmail(fac.email);
    setFormPhone(fac.phone);
    setFormStatus(fac.status);
    setFormDateJoined(fac.dateJoined || '');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingFacultyId(null);
    setFormName('');
    setFormEmpId('');
    setFormDept('Department of Pharmacology');
    setFormDesignation('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('Active');
    setFormDateJoined('');
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the Master Faculty Registry?`)) {
      const updated = faculty.filter(f => f.id !== id);
      handleSaveFaculty(updated);
      showToast(`${name} removed from registry.`);
    }
  };

  // Filtered & Sorted List (Grouped by Department A-Z, then Name A-Z)
  const filteredFaculty = React.useMemo(() => {
    const list = faculty.filter(fac => {
      if (filterDept !== 'All' && fac.dept !== filterDept) return false;
      if (filterStatus !== 'All' && fac.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = fac.name.toLowerCase().includes(q);
        const empMatch = fac.empId.toLowerCase().includes(q);
        const emailMatch = fac.email.toLowerCase().includes(q);
        const deptMatch = fac.dept.toLowerCase().includes(q);
        if (!nameMatch && !empMatch && !emailMatch && !deptMatch) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const deptA = (a.dept || '').toLowerCase();
      const deptB = (b.dept || '').toLowerCase();
      if (deptA !== deptB) return deptA.localeCompare(deptB);
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [faculty, filterDept, filterStatus, search]);

  // Calculate Years of Service
  const calculateYearsOfService = (dateJoinedStr: string): string => {
    if (!dateJoinedStr) return 'Not set';
    const joined = new Date(dateJoinedStr);
    if (isNaN(joined.getTime())) return 'Not set';
    const now = new Date();
    let years = now.getFullYear() - joined.getFullYear();
    let months = now.getMonth() - joined.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return 'Not set';
    if (years === 0) return `${months} months`;
    return `${years} yrs ${months > 0 ? `${months} mos` : ''}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#8B1E3F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-sm border border-gray-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8B1E3F] bg-pink-100/60 px-3 py-1 rounded-full border border-pink-200/50">
                Master Database
              </span>
              <span className="text-xs text-gray-400">• Permanent Profiles</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-gray-900 mt-1 flex items-center gap-2">
              👨‍🏫 Master Faculty Registry
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Permanent faculty profile records. Yearly teaching assignments are managed separately under Teaching Allocation.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Register New Faculty
        </button>
      </div>

      {/* Filter & Search Bar */}
      <GlassCard className="p-4 rounded-3xl border border-white/40 shadow-sm bg-white/70">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, employee ID, email, department..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d.replace('Department of ', '')}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200">
            Total Permanent Records: {filteredFaculty.length}
          </div>
        </div>
      </GlassCard>

      {/* Master Faculty Table */}
      <GlassCard className="p-0 rounded-3xl border border-white/40 overflow-hidden shadow-sm bg-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/70 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="py-3.5 px-3 w-[1%] whitespace-nowrap text-center">S.No</th>
                <th className="py-3.5 px-5 w-auto">Faculty Name</th>
                <th className="py-3.5 px-4 w-[1%] whitespace-nowrap">Employee ID</th>
                <th className="py-3.5 px-4 w-[1%] whitespace-nowrap">Department</th>
                <th className="py-3.5 px-4 w-[1%] whitespace-nowrap">Designation</th>
                <th className="py-3.5 px-4 w-[1%] whitespace-nowrap">Contact Information</th>
                <th className="py-3.5 px-4 w-[1%] whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 w-[1%] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredFaculty.map((fac, idx) => (
                <tr key={fac.id} className="hover:bg-pink-50/30 transition-colors group">
                  {/* S.No */}
                  <td className="py-3.5 px-3 text-center font-bold text-gray-400 text-xs w-[1%] whitespace-nowrap">
                    {idx + 1}
                  </td>

                  {/* Faculty Name */}
                  <td className="py-4 px-5 w-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                        {fac.name.replace('Dr. ', '').replace('Prof. ', '').replace('Mrs. ', '').split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-[#8B1E3F] transition-colors">
                          {fac.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Joined: {fac.dateJoined ? fac.dateJoined : <span className="italic">Not set</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="py-4 px-4 font-mono font-bold text-gray-800 w-[1%] whitespace-nowrap">
                    {fac.empId}
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4 text-gray-800 font-semibold w-[1%] whitespace-nowrap" title={fac.dept}>
                    {fac.dept.replace('Department of ', '')}
                  </td>

                  {/* Designation */}
                  <td className="py-4 px-4 font-bold text-[#8B1E3F] w-[1%] whitespace-nowrap">
                    {fac.designation || <span className="text-gray-400 font-normal italic">Not set (Faculty to edit)</span>}
                  </td>

                  {/* Official Email & Phone */}
                  <td className="py-4 px-4 w-[1%] whitespace-nowrap">
                    <div className="text-gray-800 font-medium">{fac.email}</div>
                    <div className="text-[10px] text-gray-400">{fac.phone}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 w-[1%] whitespace-nowrap">
                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                      fac.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : fac.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {fac.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-5 text-right w-[1%] whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Profile Button */}
                      <button
                        onClick={() => setSelectedFacultyProfile(fac)}
                        className="px-3 py-1.5 bg-pink-50 hover:bg-[#8B1E3F] text-[#8B1E3F] hover:text-white font-bold text-[10px] rounded-xl border border-pink-200 transition-all flex items-center gap-1 cursor-pointer"
                        title="View Faculty Profile & Teaching History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Profile
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => startEdit(fac)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#8B1E3F] hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        title="Edit Master Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteFaculty(fac.id, fac.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        title="Delete Master Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-semibold text-xs">
                    No faculty members found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add / Edit Faculty Master Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white/20 animate-scale-up space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#8B1E3F] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    {editingFacultyId ? 'Edit Master Faculty Record' : 'Register Permanent Faculty'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Permanent master profile stored in faculty database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Name & Emp ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. J. Kavitha"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    placeholder="e.g. 1800682"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 uppercase"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  Designation <span className="text-gray-400 font-normal">(Keep blank for faculty to edit later)</span>
                </label>
                <select
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                >
                  <option value="">-- Leave Blank (Faculty will edit later) --</option>
                  {DESIGNATIONS.map(des => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@srmist.edu.in"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>
              </div>

              {/* Status & Date Joined */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Employment Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Date Joined <span className="text-gray-400 font-normal">(Keep blank to edit later)</span>
                  </label>
                  <input
                    type="date"
                    value={formDateJoined}
                    onChange={(e) => setFormDateJoined(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8B1E3F] text-white font-bold text-xs rounded-xl hover:bg-[#721733] shadow-sm cursor-pointer"
                >
                  Save Master Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer (View Profile) */}
      {selectedFacultyProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-slide-left space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 text-white font-black text-base flex items-center justify-center shadow-md">
                    {selectedFacultyProfile.name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">{selectedFacultyProfile.name}</h3>
                    <p className="text-xs text-[#8B1E3F] font-bold">{selectedFacultyProfile.designation || 'Not set (Faculty can edit later)'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFacultyProfile(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Faculty Details Card */}
              <GlassCard className="p-4 rounded-2xl border border-gray-200/60 bg-gray-50/50 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                  Permanent Faculty Details
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Employee ID</span>
                    <span className="font-mono font-bold text-gray-900">{selectedFacultyProfile.empId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Years of Service</span>
                    <span className="font-bold text-gray-900">{calculateYearsOfService(selectedFacultyProfile.dateJoined)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Official Email</span>
                    <span className="font-medium text-gray-800 break-all">{selectedFacultyProfile.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Phone Number</span>
                    <span className="font-medium text-gray-800">{selectedFacultyProfile.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Department</span>
                    <span className="font-semibold text-gray-900">{selectedFacultyProfile.dept}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Date Joined</span>
                    <span className="font-medium text-gray-800">{selectedFacultyProfile.dateJoined || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Employment Status</span>
                    <span className="font-bold text-emerald-700">{selectedFacultyProfile.status}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Teaching History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#8B1E3F]" />
                    Teaching History Timeline
                  </h4>
                  <span className="text-[9px] font-extrabold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Read-Only Audit
                  </span>
                </div>

                {(() => {
                  const history = getFacultyTeachingHistory(selectedFacultyProfile.id);
                  const years = Object.keys(history).sort().reverse();

                  if (years.length === 0) {
                    return (
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-400 font-medium">
                        No teaching allocations recorded for this faculty member yet.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-pink-200">
                      {years.map((yr) => (
                        <div key={yr} className="relative pl-8">
                          {/* Timeline Node */}
                          <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-[#8B1E3F] border-2 border-white shadow-xs" />

                          <div className="bg-pink-50/40 p-3 rounded-2xl border border-pink-100 space-y-2">
                            <span className="text-xs font-black text-[#8B1E3F] bg-white px-2.5 py-0.5 rounded-full border border-pink-200/60 inline-block">
                              {yr}
                            </span>

                            <div className="space-y-1.5 pt-1">
                              {history[yr].map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-pink-100/50 shadow-2xs">
                                  <div>
                                    <span className="font-mono text-[10px] font-black text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded mr-1.5">
                                      {assignment.courseCode}
                                    </span>
                                    <span className="font-semibold text-gray-800">{assignment.courseName}</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-500 uppercase bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                                    {assignment.role}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedFacultyProfile(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
