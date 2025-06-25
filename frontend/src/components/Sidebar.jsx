import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className={collapsed ? 'fas fa-bars' : 'fas fa-times'}></i>
        </button>
        {!collapsed && <h4 className="sidebar-title">G-Scores</h4>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <i className="fas fa-home"></i> {!collapsed && <span className="nav-text">Dashboard</span>}
        </NavLink>
        <NavLink to="/search" className="nav-item">
          <i className="fas fa-search"></i> {!collapsed && <span className="nav-text">Tra cứu điểm</span>}
        </NavLink>
        <NavLink to="/reports" className="nav-item">
          <i className="fas fa-file-alt"></i> {!collapsed && <span className="nav-text">Báo cáo</span>}
        </NavLink>
        <NavLink to="/settings" className="nav-item">
          <i className="fas fa-cog"></i> {!collapsed && <span className="nav-text">Cài đặt</span>}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;