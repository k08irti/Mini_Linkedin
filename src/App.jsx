import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Briefcase, User, Search, MapPin, Building, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Auth Context
const AuthContext = createContext(null);

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-linkedin-blue font-bold text-2xl">
          <Briefcase className="w-8 h-8 fill-current" />
          <span>Jobly</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-black">Jobs</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
              {user.role === 'employer' && (
                <Link to="/post-job" className="flex items-center gap-1 text-linkedin-blue font-medium">
                  <PlusCircle className="w-5 h-5" /> Post Job
                </Link>
              )}
              <div className="flex items-center gap-4 border-l pl-6">
                <span className="text-sm font-medium text-gray-700">Hi, {user.name}</span>
                <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-4 py-2 text-linkedin-blue font-medium hover:bg-blue-50 rounded-full">Sign In</Link>
              <Link to="/register" className="px-4 py-2 bg-linkedin-blue text-white font-medium rounded-full hover:bg-blue-700 transition">Join now</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetch('/api/jobs') // Changed to relative path
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(locationTerm.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const handleApply = async (jobId) => {
    if (!user) return alert('Please login to apply');
    const res = await fetch(`/api/apply/${jobId}`, { // Changed to relative path
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) alert('Application successful!');
    else alert('Failed to apply or already applied');
  };

  const handleGuidanceClick = (feature) => {
    alert(`"${feature}" feature coming soon!`);
  };

  if (loading) return <div className="p-10 text-center">Loading jobs...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-linkedin-blue outline-none" 
            placeholder="Search job titles, companies, descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-linkedin-blue outline-none" 
            placeholder="Location..." 
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
          />
        </div>
        <button className="bg-linkedin-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">Search</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={job.id} 
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-blue-50 flex items-center justify-center rounded-lg text-linkedin-blue">
                      <Building className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold hover:text-linkedin-blue cursor-pointer transition-colors">{job.title}</h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-bold uppercase">{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{job.salary}</span>
                    <p className="text-xs text-gray-400 mt-1">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => handleApply(job.id)}
                    className="bg-linkedin-blue text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
                  >
                    Easy Apply
                  </button>
                  <button className="px-6 py-2 border border-linkedin-blue text-linkedin-blue rounded-full font-medium hover:bg-blue-50 transition">
                    Save
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
              No jobs found matching your criteria.
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
            <h4 className="font-bold text-lg mb-4">Job seeker guidance</h4>
            <p className="text-gray-600 text-sm mb-4">Explore our curated guides to help you land your dream role.</p>
            <div className="space-y-4">
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleGuidanceClick('Resume builder')}
              >
                <p className="font-bold text-sm">Resume builder</p>
                <p className="text-xs text-gray-500">Create a professional resume</p>
              </div>
              <div 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleGuidanceClick('Interview prep')}
              >
                <p className="font-bold text-sm">Interview prep</p>
                <p className="text-xs text-gray-500">Common questions answered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetch('/api/my-applications', { // Changed to relative path
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => setApplications(data));
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-linkedin-blue" />
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
      </div>
      
      {user?.role === 'candidate' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Job Title</th>
                <th className="px-6 py-4 font-bold text-gray-700">Company</th>
                <th className="px-6 py-4 font-bold text-gray-700">Applied Date</th>
                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4 font-medium">{app.title}</td>
                  <td className="px-6 py-4 text-gray-600">{app.company}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(app.applied_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{app.status}</span>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No applications found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-600">
            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Active Jobs</p>
            <p className="text-4xl font-black mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-600">
            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Total Applications</p>
            <p className="text-4xl font-black mt-2">84</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-yellow-600">
            <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">New Hires</p>
            <p className="text-4xl font-black mt-2">3</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', salary: '', description: '', type: 'Full-time'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/jobs', { // Changed to relative path
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert('Job posted successfully!');
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border">
        <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
            <input required className="w-full px-4 py-2 border rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Company</label>
              <input required className="w-full px-4 py-2 border rounded-lg" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Salary Range</label>
              <input required className="w-full px-4 py-2 border rounded-lg" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
              <input required className="w-full px-4 py-2 border rounded-lg" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
              <select className="w-full px-4 py-2 border rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea required rows="4" className="w-full px-4 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-linkedin-blue text-white py-3 rounded-full font-bold hover:bg-blue-700 transition">Post Job Opening</button>
        </form>
      </div>
    </div>
  );
};

const Auth = ({ mode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const res = await fetch(endpoint, { // Changed to relative path
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      if (mode === 'login') {
        login(data.user, data.token);
        navigate('/');
      } else {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border w-full max-w-md">
        <div className="text-center mb-8">
          <Briefcase className="w-12 h-12 text-linkedin-blue mx-auto mb-2" />
          <h1 className="text-2xl font-bold">{mode === 'login' ? 'Sign in' : 'Join Jobly'}</h1>
          <p className="text-gray-500">Stay updated on your professional world</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required className="w-full px-4 py-3 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">I am a...</label>
                <select className="w-full px-4 py-3 border rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="candidate">Candidate (Seeking Work)</option>
                  <option value="employer">Employer (Hiring)</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input required type="email" className="w-full px-4 py-3 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input required type="password" className="w-full px-4 py-3 border rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button className="w-full bg-linkedin-blue text-white py-3 rounded-full font-bold hover:bg-blue-700 transition">
            {mode === 'login' ? 'Sign in' : 'Agree & Join'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <p>New to Jobly? <Link to="/register" className="text-linkedin-blue font-bold">Join now</Link></p>
          ) : (
            <p>Already on Jobly? <Link to="/login" className="text-linkedin-blue font-bold">Sign in</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen bg-[#f3f2ef]">
        <Navbar />
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/post-job" element={user?.role === 'employer' ? <PostJob /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}