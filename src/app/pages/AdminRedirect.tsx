import { Navigate } from 'react-router-dom';

export default function AdminRedirect() {
  // Check if we're on mobile synchronously (less than lg breakpoint = 1024px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // On mobile, don't redirect - let the AdminLayout show the sidebar
  // On desktop, redirect to dashboard as before
  if (isMobile) {
    return null;
  }

  return <Navigate to="/admin/dashboard" replace />;
}
