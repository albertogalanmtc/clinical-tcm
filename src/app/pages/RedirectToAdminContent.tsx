import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectToAdminContent() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/content', { replace: true });
  }, [navigate]);

  return null;
}
