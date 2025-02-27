// @deno-types="@types/react"
import { useState } from "react";
import { useAuthStore } from "../../data-stores/auth.ts";
import { useThemeStore } from "../../data-stores/theme.ts";

// Setting item component
interface SettingItemProps {
  icon: string;
  label: string;
  value?: string | number;
  toggle?: boolean;
  isToggled?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  danger?: boolean;
}

const SettingItem = ({ 
  icon, 
  label, 
  value, 
  toggle, 
  isToggled, 
  onToggle, 
  onClick,
  danger 
}: SettingItemProps) => {
  const { darkMode } = useThemeStore();
  
  return (
    <div 
      className={`flex items-center justify-between p-4 mb-2 rounded-xl cursor-pointer
        ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
        border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}
      onClick={onClick || onToggle}
    >
      <div className="flex items-center">
        <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3
          ${danger ? 'bg-red-500' : 'bg-primary bg-opacity-20'}`}>
          <span className={danger ? 'text-white' : 'text-primary'}>{icon}</span>
        </div>
        <span className={danger ? 'text-red-500 font-medium' : ''}>{label}</span>
      </div>
      
      {toggle ? (
        <div
          className={`w-12 h-6 rounded-full relative transition-colors
            ${isToggled ? 'bg-primary' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
        >
          <div
            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all
              ${isToggled ? 'right-0.5' : 'left-0.5'}`}
          ></div>
        </div>
      ) : value ? (
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{value}</span>
      ) : (
        <span className="text-gray-400">〉</span>
      )}
    </div>
  );
};

// Interface for ProfilePage props
interface ProfilePageProps {
  isEmbedded?: boolean;
}

// Profile page component
const ProfilePage = ({ isEmbedded = false }: ProfilePageProps) => {
  const { darkMode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [notifications, setNotifications] = useState(true);
  
  // Modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const handleGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal);
    setShowGoalModal(false);
  };
  
  // If embedded mode, return just the core settings, no layout container
  if (isEmbedded) {
    return (
      <>
        <h2 className="text-lg font-semibold mb-3">Goals & Preferences</h2>
      
      {/* Settings sections */}
      <div className="mb-6">
        <SettingItem 
          icon="🎯" 
          label="Daily Calorie Goal" 
          value={`${dailyGoal} calories`}
          onClick={() => setShowGoalModal(true)}
        />
        
        <SettingItem 
          icon="🔔" 
          label="Notifications" 
          toggle 
          isToggled={notifications}
          onToggle={() => setNotifications(!notifications)}
        />
        
        <SettingItem 
          icon="🌓" 
          label="Dark Mode" 
          toggle
          isToggled={darkMode}
          onToggle={toggleTheme}
        />
      </div>
        
        {!isEmbedded && (
          <>
            <h2 className="text-lg font-semibold mb-3">App Settings</h2>
            
            <div className="mb-6">
              <SettingItem 
                icon="📊" 
                label="Export Data" 
                onClick={() => alert("This would export your data")}
              />
              
              <SettingItem 
                icon="📱" 
                label="App Version" 
                value="1.0.0"
              />
            </div>
            
            <div className="mt-8">
              <SettingItem 
                icon="🚪" 
                label="Sign Out" 
                danger
                onClick={logout}
              />
            </div>
          </>
        )}
        
        {/* Calorie goal modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`w-5/6 p-6 rounded-2xl shadow-lg 
              ${darkMode ? 'bg-dark' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-4">Set Daily Calorie Goal</h3>
              
              <div className="space-y-4 mb-6">
                {[1500, 2000, 2500, 3000].map(goal => (
                  <div 
                    key={goal}
                    onClick={() => handleGoalChange(goal)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer
                      ${dailyGoal === goal 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <span>{goal} calories</span>
                    {dailyGoal === goal && (
                      <span className="text-primary">✓</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="px-5 py-2 text-primary font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  // Regular page view
  return (
    <div className="px-5 pt-4 pb-10">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {/* User info card */}
      <div className={`rounded-3xl p-6 mb-6 
        ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
        border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mr-4">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.email?.split('@')[0] || 'User'}</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-3">Goals & Preferences</h2>
      
      {/* Settings sections */}
      <div className="mb-6">
        <SettingItem 
          icon="🎯" 
          label="Daily Calorie Goal" 
          value={`${dailyGoal} calories`}
          onClick={() => setShowGoalModal(true)}
        />
        
        <SettingItem 
          icon="🔔" 
          label="Notifications" 
          toggle 
          isToggled={notifications}
          onToggle={() => setNotifications(!notifications)}
        />
        
        <SettingItem 
          icon="🌓" 
          label="Dark Mode" 
          toggle
          isToggled={darkMode}
          onToggle={toggleTheme}
        />
      </div>
      
      <h2 className="text-lg font-semibold mb-3">App Settings</h2>
      
      <div className="mb-6">
        <SettingItem 
          icon="📊" 
          label="Export Data" 
          onClick={() => alert("This would export your data")}
        />
        
        <SettingItem 
          icon="📱" 
          label="App Version" 
          value="1.0.0"
        />
      </div>
      
      <div className="mt-8">
        <SettingItem 
          icon="🚪" 
          label="Sign Out" 
          danger
          onClick={logout}
        />
      </div>
      
      {/* Calorie goal modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-5/6 p-6 rounded-2xl shadow-lg 
            ${darkMode ? 'bg-dark' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Set Daily Calorie Goal</h3>
            
            <div className="space-y-4 mb-6">
              {[1500, 2000, 2500, 3000].map(goal => (
                <div 
                  key={goal}
                  onClick={() => handleGoalChange(goal)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer
                    ${dailyGoal === goal 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <span>{goal} calories</span>
                  {dailyGoal === goal && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-5 py-2 text-primary font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;