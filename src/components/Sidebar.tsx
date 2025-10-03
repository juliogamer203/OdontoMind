import React from 'react';
import { Tab } from '@/types';
import { ClipboardListIcon, DocumentIcon, HomeIcon, LogoIcon, MicrophoneIcon, SparklesIcon, UserCircleIcon, XIcon } from './Icons';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  tabName: Tab;
  label: string;
  icon: React.ReactNode;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
}> = ({ tabName, label, icon, activeTab, onClick }) => {
  const isActive = activeTab === tabName;
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-sky-600 text-white shadow-md'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
      onClick={() => onClick(tabName)}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const iconClass = "w-6 h-6";
  const { supabase } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleNavItemClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex flex-col p-4 shadow-lg z-40 transform transition-transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10 p-2">
          <div className="flex items-center">
            <LogoIcon className="w-10 h-10 text-sky-400" />
            <h1 className="text-2xl font-bold ml-3">OdontoMind</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav>
          <ul>
            <NavItem tabName="inicio" label="Início" icon={<HomeIcon className={iconClass} />} activeTab={activeTab} onClick={handleNavItemClick} />
            <NavItem tabName="notebooks" label="Notebooks" icon={<DocumentIcon className={iconClass} />} activeTab={activeTab} onClick={handleNavItemClick} />
            <NavItem tabName="resumos" label="Resumos" icon={<SparklesIcon className={iconClass} />} activeTab={activeTab} onClick={handleNavItemClick} />
            <NavItem tabName="atividades" label="Atividades" icon={<ClipboardListIcon className={iconClass} />} activeTab={activeTab} onClick={handleNavItemClick} />
            <NavItem tabName="aulas" label="Aulas Gravadas" icon={<MicrophoneIcon className={iconClass} />} activeTab={activeTab} onClick={handleNavItemClick} />
          </ul>
        </nav>
        <div className="mt-auto">
          <NavItem tabName="perfil" label="Perfil" icon={<UserCircleIcon className={iconClass} />} activeTab={activeTab} onClick={handleNavItemClick} />
          <button
            onClick={handleSignOut}
            className="flex items-center p-3 my-1 rounded-lg w-full text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-4 font-medium">Sair</span>
          </button>
          <p className="text-center text-xs text-slate-500 mt-4">beta 0.0.1</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;