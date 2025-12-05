import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Unit, UnitStatus, UserRole, TaskType, Task } from './types';
import { StorageService } from './services/storageService';
import { GeminiService } from './services/geminiService';
import { Button } from './components/Button';
import { StatusBadge } from './components/StatusBadge';
import { 
  LogOut, Plus, Upload, Camera, CheckSquare, 
  MapPin, User as UserIcon, Calendar, ArrowLeft,
  Sparkles, Check, X, AlertTriangle, ChevronRight,
  ClipboardList, Home
} from 'lucide-react';

// --- SUB-COMPONENTS (Defined within App to keep file count low while maintaining structure) ---

// 1. Layout Component
const Layout: React.FC<{ user: User; onLogout: () => void; children: React.ReactNode }> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 hidden sm:block">CleanCommand</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 mr-2">
               {user.avatarUrl && <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200" />}
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium text-slate-900 leading-tight">{user.name}</p>
                 <p className="text-xs text-slate-500">{user.role}</p>
               </div>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

// 2. Unit Card Component
const UnitCard: React.FC<{ unit: Unit; onClick: () => void }> = ({ unit, onClick }) => {
  const totalTasks = unit.tasks.length;
  const completedTasks = unit.tasks.filter(t => t.isCompleted).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-3 active:scale-[0.99] transition-transform cursor-pointer hover:border-brand-300"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-slate-900">{unit.name}</h3>
          <div className="flex items-center text-slate-500 text-xs mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {unit.address}
          </div>
        </div>
        <StatusBadge status={unit.status} />
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center text-slate-500">
           <Calendar className="w-4 h-4 mr-1.5" />
           Due: {unit.deadline}
        </div>
        <div className="flex items-center text-slate-500">
           <ClipboardList className="w-4 h-4 mr-1.5" />
           {completedTasks}/{totalTasks} Tasks
        </div>
      </div>

      <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
        <div 
          className="bg-brand-500 h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};

// 3. Task Item Component
interface TaskItemProps {
  task: Task;
  readOnly: boolean;
  onToggle: (taskId: string) => void;
  onAddPhoto: (taskId: string, base64: string) => void;
  onRemovePhoto: (taskId: string, index: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, readOnly, onToggle, onAddPhoto, onRemovePhoto }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onAddPhoto(task.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    if (task.photoProofs.length >= 5) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={`border rounded-lg mb-3 overflow-hidden ${task.isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <button 
            disabled={readOnly}
            onClick={() => onToggle(task.id)}
            className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white'}`}
          >
            {task.isCompleted && <Check className="w-4 h-4 text-white" />}
          </button>
          <div onClick={() => setIsExpanded(!isExpanded)} className="flex-1 cursor-pointer">
            <div className="flex items-center">
              <span className={`text-sm font-medium ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                {task.title}
              </span>
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${task.type === TaskType.INVENTORY ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                {task.type}
              </span>
            </div>
            {task.photoProofs.length > 0 && (
               <div className="text-xs text-slate-400 mt-1 flex items-center">
                 <Camera className="w-3 h-3 mr-1" /> {task.photoProofs.length} photos attached
               </div>
            )}
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-slate-400">
          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-slate-100 bg-slate-50 pt-3">
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Photo Proof (Max 5)</h4>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {!readOnly && task.photoProofs.length < 5 && (
                <button 
                  onClick={triggerUpload}
                  className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
              {task.photoProofs.map((photo, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                  <img src={photo} alt="proof" className="w-full h-full object-cover" />
                  {!readOnly && (
                    <button 
                      onClick={() => onRemovePhoto(task.id, idx)}
                      className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Modal for Creating Unit (Admin Only)
const CreateUnitModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: () => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [deadline, setDeadline] = useState('12:00 PM');
  const [assignedTo, setAssignedTo] = useState('');
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const users = StorageService.getUsers().filter(u => u.role === UserRole.CLEANER);

  if (!isOpen) return null;

  const handleAutoGenerate = async () => {
    if (!name) return;
    setGenerating(true);
    const newTasks = await GeminiService.generateTasksForUnit(name + (address ? ` at ${address}` : ''));
    setTasks(newTasks.map((t, i) => ({ ...t, id: `gen-${i}-${Date.now()}`, isCompleted: false, photoProofs: [] })));
    setGenerating(false);
  };

  const handleSave = () => {
    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      name,
      address,
      deadline,
      status: UnitStatus.OPEN,
      assignedUserId: assignedTo || null,
      tasks,
      lastUpdated: Date.now()
    };
    StorageService.addUnit(newUnit);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg text-slate-900">Add New Unit</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
            <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Sunset Apt 101" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
               <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={deadline} onChange={e => setDeadline(e.target.value)} />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Assign Cleaner</label>
               <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                 <option value="">Unassigned</option>
                 {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">Tasks</label>
              <button 
                onClick={handleAutoGenerate} 
                disabled={!name || generating}
                className="text-xs flex items-center text-brand-600 font-medium hover:text-brand-700 disabled:opacity-50"
              >
                {generating ? <div className="animate-spin w-3 h-3 mr-1 border-2 border-brand-600 border-t-transparent rounded-full" /> : <Sparkles className="w-3 h-3 mr-1" />}
                Auto-Generate with AI
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">No tasks added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Use AI to generate or add manually (manual add not impl in demo).</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t, idx) => (
                  <div key={idx} className="flex items-center p-2 bg-slate-50 rounded text-sm">
                    <span className={`w-2 h-2 rounded-full mr-2 ${t.type === TaskType.CLEANING ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    {t.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Button fullWidth onClick={handleSave} disabled={!name || tasks.length === 0}>Create Unit</Button>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'LIST' | 'DETAIL'>('LOGIN');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | UnitStatus>('ALL');

  // Load initial data
  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('LIST');
    }
    loadUnits();
  }, []);

  const loadUnits = useCallback(() => {
    const allUnits = StorageService.getUnits();
    setUnits(allUnits);
  }, []);

  const handleLogin = (email: string) => {
    const user = StorageService.login(email);
    if (user) {
      setCurrentUser(user);
      setView('LIST');
      loadUnits();
    } else {
      alert('User not found. Try "admin@clean.com" or "john@clean.com"');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setView('LOGIN');
    setSelectedUnit(null);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setView('DETAIL');
  };

  const handleBack = () => {
    setSelectedUnit(null);
    setView('LIST');
    loadUnits(); // Refresh in case of background updates
  };

  const handleTaskToggle = (taskId: string) => {
    if (!selectedUnit) return;
    const updatedTasks = selectedUnit.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const updatedUnit = { ...selectedUnit, tasks: updatedTasks };
    setSelectedUnit(updatedUnit);
    StorageService.updateUnit(updatedUnit);
  };

  const handleAddPhoto = (taskId: string, base64: string) => {
    if (!selectedUnit) return;
    const updatedTasks = selectedUnit.tasks.map(t => {
      if (t.id === taskId) {
        if (t.photoProofs.length >= 5) return t;
        return { ...t, photoProofs: [...t.photoProofs, base64] };
      }
      return t;
    });
    const updatedUnit = { ...selectedUnit, tasks: updatedTasks };
    setSelectedUnit(updatedUnit);
    StorageService.updateUnit(updatedUnit);
  };

  const handleRemovePhoto = (taskId: string, index: number) => {
    if (!selectedUnit) return;
    const updatedTasks = selectedUnit.tasks.map(t => {
      if (t.id === taskId) {
        const newPhotos = [...t.photoProofs];
        newPhotos.splice(index, 1);
        return { ...t, photoProofs: newPhotos };
      }
      return t;
    });
    const updatedUnit = { ...selectedUnit, tasks: updatedTasks };
    setSelectedUnit(updatedUnit);
    StorageService.updateUnit(updatedUnit);
  };

  const handleSubmitProject = () => {
    if (!selectedUnit) return;
    // Validate
    const incomplete = selectedUnit.tasks.some(t => !t.isCompleted);
    if (incomplete) {
      alert("All tasks must be checked before submitting.");
      return;
    }
    const missingPhotos = selectedUnit.tasks.some(t => t.photoProofs.length === 0);
    if (missingPhotos) {
      alert("All tasks must have at least one photo proof.");
      return;
    }

    const updatedUnit: Unit = { ...selectedUnit, status: UnitStatus.SUBMITTED };
    StorageService.updateUnit(updatedUnit);
    setSelectedUnit(updatedUnit);
    alert("Project submitted for review!");
    handleBack();
  };

  const handleAdminAction = (status: UnitStatus) => {
    if (!selectedUnit) return;
    const updatedUnit: Unit = { ...selectedUnit, status };
    StorageService.updateUnit(updatedUnit);
    setSelectedUnit(updatedUnit);
    handleBack();
  };

  // --- VIEW RENDERING ---

  if (!currentUser || view === 'LOGIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-600 p-3 rounded-xl">
               <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8">Sign in to manage your cleaning tasks</p>
          
          <div className="space-y-4">
             <Button fullWidth onClick={() => handleLogin('admin@clean.com')}>Login as Admin (Sarah)</Button>
             <Button fullWidth variant="outline" onClick={() => handleLogin('john@clean.com')}>Login as Cleaner (John)</Button>
             <Button fullWidth variant="ghost" onClick={() => handleLogin('jane@clean.com')}>Login as Cleaner (Jane)</Button>
          </div>
        </div>
      </div>
    );
  }

  // Filter Units Logic
  const filteredUnits = units.filter(u => {
    // Role filter
    if (currentUser.role === UserRole.CLEANER && u.assignedUserId !== currentUser.id) return false;
    // Status filter
    if (filter !== 'ALL' && u.status !== filter) return false;
    return true;
  });

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      {view === 'LIST' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {currentUser.role === UserRole.ADMIN ? 'All Units' : 'My Assignments'}
            </h2>
            {currentUser.role === UserRole.ADMIN && (
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-1">
                <Plus className="w-4 h-4" /> <span>New Unit</span>
              </Button>
            )}
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
            {['ALL', UnitStatus.OPEN, UnitStatus.SUBMITTED, UnitStatus.REWORK, UnitStatus.SUCCESS].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {s === 'ALL' ? 'All Units' : s}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredUnits.length > 0 ? (
              filteredUnits.map(unit => (
                <UnitCard key={unit.id} unit={unit} onClick={() => handleUnitClick(unit)} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500">No units found matching criteria.</p>
              </div>
            )}
          </div>

          {showCreateModal && (
            <CreateUnitModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={loadUnits} />
          )}
        </>
      )}

      {view === 'DETAIL' && selectedUnit && (
        <div className="animate-in slide-in-from-right duration-300">
           <button onClick={handleBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-4 transition-colors">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
           </button>

           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{selectedUnit.name}</h1>
                  <div className="flex items-center text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" /> {selectedUnit.address}
                  </div>
               </div>
               <StatusBadge status={selectedUnit.status} />
             </div>
             
             <div className="flex flex-wrap gap-4 text-sm border-t border-slate-100 pt-4 mt-2">
               <div className="flex items-center bg-slate-50 px-3 py-1 rounded-lg">
                 <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                 <span className="text-slate-600">
                    {StorageService.getUsers().find(u => u.id === selectedUnit.assignedUserId)?.name || 'Unassigned'}
                 </span>
               </div>
               <div className="flex items-center bg-slate-50 px-3 py-1 rounded-lg">
                 <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                 <span className="text-slate-600">{selectedUnit.deadline}</span>
               </div>
             </div>
           </div>

           <div className="space-y-4 mb-20">
             <h3 className="font-bold text-slate-900 flex items-center">
               Tasks 
               <span className="ml-2 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                 {selectedUnit.tasks.length}
               </span>
             </h3>
             {selectedUnit.tasks.map(task => (
               <TaskItem 
                 key={task.id} 
                 task={task} 
                 readOnly={currentUser.role === UserRole.CLEANER && selectedUnit.status !== UnitStatus.OPEN && selectedUnit.status !== UnitStatus.REWORK}
                 onToggle={handleTaskToggle}
                 onAddPhoto={handleAddPhoto}
                 onRemovePhoto={handleRemovePhoto}
               />
             ))}
           </div>

           {/* Sticky Action Bar */}
           <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
             <div className="max-w-5xl mx-auto flex gap-3">
               {currentUser.role === UserRole.CLEANER && (selectedUnit.status === UnitStatus.OPEN || selectedUnit.status === UnitStatus.REWORK) && (
                 <Button fullWidth onClick={handleSubmitProject}>Submit Project</Button>
               )}
               
               {currentUser.role === UserRole.ADMIN && selectedUnit.status === UnitStatus.SUBMITTED && (
                 <>
                   <Button fullWidth variant="danger" onClick={() => handleAdminAction(UnitStatus.REWORK)}>Reject (Rework)</Button>
                   <Button fullWidth variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => handleAdminAction(UnitStatus.SUCCESS)}>Approve (Success)</Button>
                 </>
               )}

               {currentUser.role === UserRole.ADMIN && selectedUnit.status === UnitStatus.SUCCESS && (
                 <Button fullWidth variant="outline" onClick={() => handleAdminAction(UnitStatus.OPEN)}>Re-open Project</Button>
               )}
             </div>
           </div>
        </div>
      )}
    </Layout>
  );
}
