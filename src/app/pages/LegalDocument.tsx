import { FileText, ChevronLeft } from 'lucide-react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPlatformSettings } from '../data/platformSettings';

export default function LegalDocument() {
  const { docType } = useParams<{ docType: string }>();
  const navigate = useNavigate();

  // Map URL param to document type
  const typeMap: { [key: string]: 'terms' | 'privacy' | 'cookies' | 'refund' | 'disclaimer' } = {
    'terms': 'terms',
    'privacy': 'privacy',
    'cookies': 'cookies',
    'refund': 'refund',
    'disclaimer': 'disclaimer'
  };

  const documentType = docType ? typeMap[docType] : null;

  // Redirect to 404 if invalid document type
  if (!docType || !documentType) {
    return <Navigate to="/404" replace />;
  }

  // Redirect to /legal page with the document type in state
  // This will trigger the modal to open
  useEffect(() => {
    navigate('/legal', { 
      replace: true,
      state: { openDocument: documentType }
    });
  }, [documentType, navigate]);

  // Show nothing while redirecting
  return null;
}