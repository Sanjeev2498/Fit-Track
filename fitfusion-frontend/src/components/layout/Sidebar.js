import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiActivity, 
  FiCoffee, 
  FiTarget, 
  FiUsers, 
  FiUser 
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome
    },
    {
      name: 'Workouts',
      href: '/workouts',
      icon: FiActivity
    },
    {
      name: 'Meals',
      href: '/meals',
      icon: FiCoffee
    },
    {
      name: 'Goals',
      href: '/goals',
      icon: FiTarget
    },
    {
      name: 'Challenges',
      href: '/challenges',
      icon: FiUsers
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: FiUser
    }
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 lg:translate-x-0">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group transition-colors ${
                    isActive(item.href) 
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' 
                      : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 transition duration-75 ${
                    isActive(item.href) 
                      ? 'text-primary-700' 
                      : 'text-gray-500 group-hover:text-gray-900'
                  }`} />
                  <span className="ml-3">{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
        
        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium">5 workouts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Calories</span>
              <span className="font-medium">1,850</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Water</span>
              <span className="font-medium">2.1L</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;