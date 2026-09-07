import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Key, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Profile() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/auth/me')
        .then(res => {
          setAddresses(res.data.user?.addresses || [
            {
              name: user.name,
              phone: user.phone || '+91 99887 76655',
              streetAddress: 'Flat 402, Lotus Residency, Jubilee Hills',
              city: 'Hyderabad',
              state: 'Telangana',
              pinCode: '500033',
              addressType: 'Home'
            }
          ]);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16 space-y-8">
      <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase text-center mb-10">
        YOUR PROFILE PROFILE
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card details */}
        <div className="md:col-span-1 bg-teal-dark/30 border border-gold/15 p-6 rounded-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="h-20 w-20 bg-gold/15 text-gold flex items-center justify-center rounded-full mx-auto border border-gold">
              <User className="h-10 w-10" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-3">{user.name}</h3>
            <span className="text-[10px] bg-gold/10 text-gold px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {user.role} Member
            </span>
          </div>

          <div className="space-y-4 pt-4 border-t border-gold/10 text-xs text-gray-300">
            <div className="flex items-center space-x-3">
              <Mail className="h-4.5 w-4.5 text-gold flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4.5 w-4.5 text-gold flex-shrink-0" />
              <span>{user.phone || 'No phone set'}</span>
            </div>
          </div>
        </div>

        {/* Saved Destinations list */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-teal-dark/30 border border-gold/15 p-6 rounded-lg">
            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-widest mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Saved Shipping Addresses</span>
            </h3>

            {loading ? (
              <div className="h-24 bg-teal-dark rounded animate-pulse" />
            ) : (
              <div className="space-y-4">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-4 rounded border border-gold/10 bg-teal-dark/15 flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{addr.name}</span>
                        <span className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded uppercase font-bold">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{addr.streetAddress}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{addr.city}, {addr.state} - {addr.pinCode}</p>
                      <span className="text-[10px] text-gold font-medium block mt-2">Phone: {addr.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Security details */}
          <div className="bg-teal-dark/30 border border-gold/15 p-6 rounded-lg">
            <h3 className="font-serif text-base font-bold text-gold uppercase tracking-widest mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              <span>Account Security</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your password and personal details are encrypted. To request sub-admin access rights or adjust credential configurations, contact customer support.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
              <ShieldCheck className="h-4.5 w-4.5 text-gold" />
              <span>Two-Factor Authentication Sandbox secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
