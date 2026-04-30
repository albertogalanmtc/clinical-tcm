import { useEffect, useRef } from 'react';

let unsavedChangesCallback: (() => boolean) | null = null;

export function useUnsavedChanges(hasChanges: boolean) {
  const hasChangesRef = useRef(hasChanges);

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    // Register this component as the source of unsaved changes
    unsavedChangesCallback = () => hasChangesRef.current;

    return () => {
      // Unregister when component unmounts
      unsavedChangesCallback = null;
    };
  }, []);
}

export function checkUnsavedChanges(): boolean {
  return unsavedChangesCallback ? unsavedChangesCallback() : false;
}
