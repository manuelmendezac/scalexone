import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="ia-header">
      <div className="ia-header__logo">
        <span role="img" aria-label="logo" style={{fontSize: '2rem'}}>🌐</span>
        <span className="ia-header__title">Implementar Mi IA</span>
      </div>
      <div className="ia-header__user">
        <span className="ia-header__user-name">Manuel Méndez</span>
        <img
          src="https://ui-avatars.com/api/?name=Manuel+Mendez&background=0D8ABC&color=fff"
          alt="avatar"
          className="ia-header__avatar"
        />
      </div>
    </header>
  );
};

export default Header; 