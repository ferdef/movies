import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, List, Star, LogOut, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
  color: white;
`;

const Header = styled.header`
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #333;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #e50914;
  text-decoration: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(229, 9, 20, 0.1);
    color: #e50914;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Username = styled.span`
  color: #ccc;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e50914;
    border-color: #e50914;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 100px);
`;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <LayoutContainer>
      <Header>
        <Nav>
          <Logo to="/">
            <Film size={24} />
            Movies Tracker
          </Logo>
          
          <NavLinks>
            <NavLink to="/">
              <Home size={18} />
              Inicio
            </NavLink>
            <NavLink to="/search">
              <Search size={18} />
              Buscar
            </NavLink>
            <NavLink to="/watchlist">
              <List size={18} />
              Mi Lista
            </NavLink>
            <NavLink to="/recommendations">
              <Star size={18} />
              Recomendaciones
            </NavLink>
          </NavLinks>
          
          <UserSection>
            <Username>¡Hola, {user?.username}!</Username>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={18} />
              Salir
            </LogoutButton>
          </UserSection>
        </Nav>
      </Header>
      
      <Main>
        {children}
      </Main>
    </LayoutContainer>
  );
};

export default Layout;