import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function UserMgmt() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => {
        setUsers(res.data.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const toggleUserBlock = async (id, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user's access?`)) return;

    try {
      const res = await api.put(`/admin/users/${id}/block`);
      if (res.data.success) {
        alert(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      alert('Error modifying user credentials.');
    }
  };

  return (
    <div className="space-y-8 pt-4 text-xs">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
          REGISTERED USERS DIRECTORY
        </h1>
        <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
          Monitor customer activity logs, control user credentials, and restrict access permissions
        </span>
      </div>

      {loading ? (
        <div className="h-64 bg-teal-dark rounded animate-pulse" />
      ) : (
        <div className="silk-card rounded-lg border border-gold/15 p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold/10 text-gray-400 uppercase tracking-widest pb-3">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email Address</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Joined Date</th>
                  <th className="py-3 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-gray-300">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gold/5 transition-colors">
                    <td className="py-3.5 font-bold text-white">{u.name}</td>
                    <td className="py-3.5">{u.email}</td>
                    <td className="py-3.5">{u.phone || 'N/A'}</td>
                    <td className="py-3.5">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => toggleUserBlock(u._id, u.isBlocked)}
                        className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border transition ${
                          u.isBlocked 
                            ? 'bg-red-950 text-red-400 border-red-500/30 hover:bg-red-900/30' 
                            : 'bg-green-950 text-green-400 border-green-500/30 hover:bg-green-900/30'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked (Suspended)' : 'Active (Access OK)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
