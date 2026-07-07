export type DoneItem = { id: string; url: string };

export function loadDoneItems(storageKey: string): DoneItem[] {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseDoneItems(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
}

export function parseDoneItems(raw: unknown): DoneItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return { id: item, url: '' };
      if (item && typeof item === 'object' && 'id' in item && 'url' in item) {
        return { id: String(item.id), url: String(item.url) };
      }
      return null;
    })
    .filter((item): item is DoneItem => item !== null);
}

export function isDoneItem(items: DoneItem[], id: string, url: string): boolean {
  return items.some((item) => item.id === id && item.url === url);
}

export function toggleDoneItem(items: DoneItem[], id: string, url: string): DoneItem[] {
  return isDoneItem(items, id, url)
    ? items.filter((item) => !(item.id === id && item.url === url))
    : [...items, { id, url }];
}

export function videoDoneUrl(video: { englishUrl?: string; arabicUrl?: string }): string {
  return video.englishUrl || video.arabicUrl || '';
}
