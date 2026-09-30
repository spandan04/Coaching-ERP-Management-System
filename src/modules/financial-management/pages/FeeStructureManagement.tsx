import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { getFeeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure } from '../services/feeService';
import { FeeStructure } from '../../../types/index';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export const FeeStructureManagement = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const emptyForm = {
    courseName: '',
    batch: '',
    registrationFees: 0,
    tuitionFees: 0,
    studyMaterialFees: 0,
    otherCharges: 0,
  };
  const [formData, setFormData] = useState(emptyForm);

  // Fetch Fee Structures
  const fetchFeeStructures = async () => {
    setLoading(true);
    try {
      setFeeStructures(await getFeeStructures());
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const totalFees = formData.registrationFees + formData.tuitionFees + formData.studyMaterialFees + formData.otherCharges;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, totalFees };
      if (editingId) {
        await updateFeeStructure(editingId, payload);
        alert("Fee structure updated successfully!");
      } else {
        await addFeeStructure(payload);
        alert("Fee structure created successfully!");
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchFeeStructures();
    } catch (error: any) {
      console.error('Error saving fee structure:', error);
      alert('Error saving fee structure: ' + error.message);
    }
  };

  const handleEdit = (s: FeeStructure) => {
    const { id, createdAt, totalFees: _, ...rest } = s;
    setFormData(rest);
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await deleteFeeStructure(id);
        fetchFeeStructures();
      } catch (error) {
        console.error('Error deleting fee structure:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fee Structures</h1>
          <p className="text-slate-400 mt-2">Create and manage course fee structures</p>
        </div>
        <button
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Structure
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl font-bold text-white mb-6">
            {editingId ? 'Edit Fee Structure' : 'Create New Fee Structure'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Course Name *</label>
                <input
                  type="text"
                  name="courseName"
                  required
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., JEE Mains"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Batch *</label>
                <input
                  type="text"
                  name="batch"
                  required
                  value={formData.batch}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., 2024-2025"
                />
              </div>
              
              {/* Fee Breakdowns */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Registration Fees (₹)</label>
                <input
                  type="number"
                  name="registrationFees"
                  min="0"
                  value={formData.registrationFees}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tuition Fees (₹)</label>
                <input
                  type="number"
                  name="tuitionFees"
                  min="0"
                  value={formData.tuitionFees}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Study Material Fees (₹)</label>
                <input
                  type="number"
                  name="studyMaterialFees"
                  min="0"
                  value={formData.studyMaterialFees}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Other Charges (₹)</label>
                <input
                  type="number"
                  name="otherCharges"
                  min="0"
                  value={formData.otherCharges}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Total Fees (Auto-calculated)</label>
                <input
                  type="number"
                  readOnly
                  value={totalFees}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-indigo-400 font-bold focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update Structure' : 'Save Structure'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Fee Structures */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Course & Batch</th>
                <th className="px-6 py-4 font-medium">Total Fees</th>
                <th className="px-6 py-4 font-medium">Breakdown</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading fee structures...</td>
                </tr>
              ) : feeStructures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No fee structures found. Add one to get started.</td>
                </tr>
              ) : (
                feeStructures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{structure.courseName}</div>
                      <div className="text-sm text-slate-500">{structure.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-bold">₹ {structure.totalFees}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div>Reg: ₹{structure.registrationFees}</div>
                      <div>Tui: ₹{structure.tuitionFees}</div>
                      {structure.studyMaterialFees > 0 && <div>Mat: ₹{structure.studyMaterialFees}</div>}
                      {structure.otherCharges > 0 && <div>Oth: ₹{structure.otherCharges}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(structure)}
                        className="p-2 text-slate-400 hover:text-indigo-400 transition-colors inline-block"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(structure.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition-colors inline-block ml-2"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
