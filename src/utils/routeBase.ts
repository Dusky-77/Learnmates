import { useLocation } from 'react-router-dom';

export function useRouteBase(): string {
  const { pathname } = useLocation();
  return pathname.startsWith('/dashboard') ? '/dashboard' : '';
}

export function withBase(base: string, path: string): string {
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
