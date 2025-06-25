import React from 'react';
import './Header.css';

const Header = ({ collapsed }) => {
  return (
    <header className={`main-header ${collapsed ? 'collapsed' : ''}`}>
      <h1 className="title">🎓 G-Scores</h1>
      <span className="welcome-msg">
        Xin chào, chào mừng tới trang thông tin tra cứu điểm đại học quốc gia
      </span>
    </header>
  );
};

export default Header;