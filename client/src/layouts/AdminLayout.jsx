import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  ArrowLeftRight, 
  Ticket, 
  Users, 
  Star, 
  Home, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Redirect if not admin or sub-admin
  React.useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Saree Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Order Logs', path: '/admin/orders', icon: Truck },
    { name: 'Returns & Refunds', path: '/admin/returns', icon: ArrowLeftRight },
    { name: 'Coupons Control', path: '/admin/coupons', icon: Ticket },
    { name: 'Users Register', path: '/admin/users', icon: Users },
    { name: 'Review Moderation', path: '/admin/reviews', icon: Star },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-teal-dark text-gray-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gold/15 bg-teal-dark flex flex-col justify-between flex-shrink-0 z-30">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-gold/10 text-center">
            <Link to="/" className="font-serif text-2xl font-bold tracking-widest text-gold block">
              VAARAHI
            </Link>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold block mt-1">
              Admin Control Loom
            </span>
          </div>

          {/* Links list */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded text-xs uppercase tracking-wider font-semibold transition ${
                    isActive 
                      ? 'bg-gold text-teal-dark font-bold shadow' 
                      : 'text-gray-400 hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gold/10 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded text-xs text-gray-400 hover:text-white transition"
          >
            <Home className="h-4 w-4" />
            <span>Store Front</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded text-xs text-red-400 hover:bg-red-950/20 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Staff</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
