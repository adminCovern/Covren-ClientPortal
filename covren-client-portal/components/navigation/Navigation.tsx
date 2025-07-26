// Sovereign Command Center Navigation Component
// Covren Firm LLC - Production Grade Navigation

import React from 'react';
import type { User } from '../../types';

interface NavigationProps {
  user: User;
  onLogout: () => void;
  notificationCount: number;
  onNotificationClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  user,
  onLogout,
  notificationCount,
  onNotificationClick,
}) => {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sovereign Command Center™</h1>
              <p className="text-xs text-gray-400">Covren Firm LLC</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-8">
          <button className="text-gray-300 hover:text-white transition-colors">
            Dashboard
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            Projects
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            Documents
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            Messages
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            Analytics
          </button>
        </div>

        {/* User Menu and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.83 19.13a11.25 11.25 0 01-1.77-1.89 9 9 0 01-.31-13.84 9 9 0 0113.36-1.64 9 9 0 01.31 13.84 11.25 11.25 0 01-1.77 1.89M8.59 21l.81.81a2 2 0 002.83 0l.81-.81a2 2 0 00-2.83 0z" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user.full_name || user.email}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 py-1 z-50">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Profile Settings
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Account Preferences
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Security Settings
              </button>
              <hr className="border-gray-700 my-1" />
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-300 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
        <div className="flex flex-col space-y-2">
          <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            Dashboard
          </button>
          <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            Projects
          </button>
          <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            Documents
          </button>
          <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            Messages
          </button>
          <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            Analytics
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 