import React, { useState, useRef, useEffect } from "react";
import TopbarOwner from "../Topbar/TopbarOwner";
import { Outlet } from "react-router-dom";

function LayoutOwner() {
  const [headerHeight, setHeaderHeight] = useState(130);
  const headerRef = useRef(null);

  // Measure header + topbar height when mounted and on window resize
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight || 130);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className="layout owner-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Fixed header + topbar for Owner */}
      <div ref={headerRef} className="owner-fixed-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="app-header">
          <h1 className="app-title">Evenza - Owner</h1>
          <div className="app-caption">Platform Owner Panel</div>
        </div>
        <TopbarOwner />
      </div>
      <div className="main-content" style={{ 
        display: 'flex', 
        flex: 1, 
        marginTop: headerHeight
      }}>
        <div className="page-content" style={{ 
          flex: 1,
          padding: 0,
          marginTop: 0,
          width: '100%'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutOwner;