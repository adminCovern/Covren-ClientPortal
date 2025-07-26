// Sovereign Command Center Responsive Wrapper Component
// Covren Firm LLC - Production Grade Mobile Optimization

import React, { useState, useEffect } from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = '',
  breakpoint = 'lg',
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveClasses = () => {
    const baseClasses = 'transition-all duration-300';
    
    if (isMobile) {
      return `${baseClasses} px-4 py-2 text-sm`;
    } else if (isTablet) {
      return `${baseClasses} px-6 py-3 text-base`;
    } else {
      return `${baseClasses} px-8 py-4 text-lg`;
    }
  };

  return (
    <div className={`${getResponsiveClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveWrapper; 