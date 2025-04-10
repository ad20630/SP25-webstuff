// components/LogoutButton.tsx
import React from 'react';

interface LogoutButtonProps {
  handleLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ handleLogout }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      margin: '10px 0' 
    }}>
      <button 
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
