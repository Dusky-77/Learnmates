import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { loadResourceEngagements, ENGAGEMENT_UPDATED_EVENT, ENGAGEMENT_STORAGE_KEY, ResourceEngagement, EngagementFlag } from '../utils/resourceEngagement';
import { loadDoneItems, parseDoneItems, DoneItem, toggleDoneItem } from '../utils/doneItems';

interface EngagementContextType {
  doneVideos: DoneItem[];
  doneResources: DoneItem[];
  engagements: ResourceEngagement[];
  toggleDoneVideo: (id: string, url: string) => void;
  toggleDoneResource: (id: string, url: string) => void;
  setEngagementFlag: (topicId: string, resourceId: string, url: string, flag: EngagementFlag) => void;
}

export const EngagementContext = createContext<EngagementContextType | null>(null);

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }
  return context;
}

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [synced, setSynced] = useState(false);
  const [doneVideos, setDoneVideosState] = useState<DoneItem[]>(() => loadDoneItems('doneVideos'));
  const [doneResources, setDoneResourcesState] = useState<DoneItem[]>(() => loadDoneItems('doneResources'));
  const [engagements, setEngagementsState] = useState<ResourceEngagement[]>(() => loadResourceEngagements());

  // Function to sync current local state up to Supabase
  const syncUp = useCallback(async (vids: DoneItem[], res: DoneItem[], engs: ResourceEngagement[]) => {
    if (!synced) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const payloadMap = new Map();
      const getPayloadItem = (topicId: string, resourceId: string, url: string, type: string) => {
        const key = `${topicId}|${resourceId}|${url}`;
        if (!payloadMap.has(key)) {
          payloadMap.set(key, { topicId, resourceId, url, resourceType: type, isDone: false, downloaded: false, opened: false, meaningfulRead: false });
        }
        return payloadMap.get(key);
      };

      res.forEach(item => getPayloadItem('', item.id, item.url, 'resource').isDone = true);
      vids.forEach(item => getPayloadItem('', item.id, item.url, 'video').isDone = true);
      engs.forEach(item => {
        const payload = getPayloadItem(item.topicId, item.resourceId, item.url, 'resource');
        payload.downloaded = item.downloaded;
        payload.opened = item.opened;
        payload.meaningfulRead = item.meaningfulRead;
      });

      const engagementsPayload = Array.from(payloadMap.values());
      if (engagementsPayload.length > 0) {
        await fetch('/api/engagement/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ engagements: engagementsPayload })
        });
      }
    } catch (error) {
      console.error('Failed to sync up engagements', error);
    }
  }, [synced]);

  // Sync DOWN from Supabase on load
  useEffect(() => {
    async function syncDown() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const response = await fetch('/api/engagement/get', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Expected JSON response from /api/engagement/get, but received HTML or other format. Are you running the backend server?');
            return;
          }
          const { engagements: dbEngagements } = await response.json();
          if (!dbEngagements) return;

          const newDoneResources: DoneItem[] = [];
          const newDoneVideos: DoneItem[] = [];
          const newEngagements: ResourceEngagement[] = [];

          dbEngagements.forEach((eng: any) => {
            if (eng.is_done) {
              if (eng.resource_type === 'video') newDoneVideos.push({ id: eng.resource_id, url: eng.resource_url });
              else newDoneResources.push({ id: eng.resource_id, url: eng.resource_url });
            }

            if (eng.downloaded || eng.opened || eng.meaningful_read) {
              newEngagements.push({
                topicId: eng.topic_id,
                resourceId: eng.resource_id,
                url: eng.resource_url,
                downloaded: !!eng.downloaded,
                opened: !!eng.opened,
                meaningfulRead: !!eng.meaningful_read
              });
            }
          });

          setDoneResourcesState(newDoneResources);
          setDoneVideosState(newDoneVideos);
          setEngagementsState(newEngagements);

          localStorage.setItem('doneResources', JSON.stringify(newDoneResources));
          localStorage.setItem('doneVideos', JSON.stringify(newDoneVideos));
          localStorage.setItem(ENGAGEMENT_STORAGE_KEY, JSON.stringify(newEngagements));
          
          window.dispatchEvent(new CustomEvent(ENGAGEMENT_UPDATED_EVENT));
        }
      } catch (error) {
        console.error('Failed to sync down engagements', error);
      } finally {
        setSynced(true);
      }
    }

    syncDown();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') syncDown();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const toggleDoneVideo = (id: string, url: string) => {
    const next = toggleDoneItem(doneVideos, id, url);
    setDoneVideosState(next);
    localStorage.setItem('doneVideos', JSON.stringify(next));
    syncUp(next, doneResources, engagements);
  };

  const toggleDoneResource = (id: string, url: string) => {
    const next = toggleDoneItem(doneResources, id, url);
    setDoneResourcesState(next);
    localStorage.setItem('doneResources', JSON.stringify(next));
    syncUp(doneVideos, next, engagements);
  };

  const setEngagementFlagHandler = (topicId: string, resourceId: string, url: string, flag: EngagementFlag) => {
    const key = `${topicId}|${resourceId}|${url}`;
    const items = [...engagements];
    const index = items.findIndex((item) => `${item.topicId}|${item.resourceId}|${item.url}` === key);

    if (index >= 0) {
      if (items[index][flag]) return;
      items[index] = { ...items[index], [flag]: true };
    } else {
      items.push({ topicId, resourceId, url, downloaded: flag === 'downloaded', opened: flag === 'opened', meaningfulRead: flag === 'meaningfulRead' });
    }

    setEngagementsState(items);
    localStorage.setItem(ENGAGEMENT_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(ENGAGEMENT_UPDATED_EVENT));
    syncUp(doneVideos, doneResources, items);
  };

  return (
    <EngagementContext.Provider value={{
      doneVideos,
      doneResources,
      engagements,
      toggleDoneVideo,
      toggleDoneResource,
      setEngagementFlag: setEngagementFlagHandler
    }}>
      {children}
    </EngagementContext.Provider>
  );
}
