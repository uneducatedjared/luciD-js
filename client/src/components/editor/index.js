'use client';

import Header from './header';
import Sidebar from './sidebar'; 

export default function MainEditor() {

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> 
      </div>
    </div>
  );
}