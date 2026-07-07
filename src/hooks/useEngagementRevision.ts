import { useEffect, useState } from 'react';
import { ENGAGEMENT_UPDATED_EVENT } from '../utils/resourceEngagement';

/** Re-renders when resource engagement or doneResources changes in localStorage. */
export function useEngagementRevision(storageKeys: string[] = ['resourceEngagement', 'doneResources']): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const bump = () => setRevision((value) => value + 1);

    window.addEventListener(ENGAGEMENT_UPDATED_EVENT, bump);

    const onStorage = (event: StorageEvent) => {
      if (event.key && storageKeys.includes(event.key)) {
        bump();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(ENGAGEMENT_UPDATED_EVENT, bump);
      window.removeEventListener('storage', onStorage);
    };
  }, [storageKeys]);

  return revision;
}
