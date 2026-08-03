import { useEffect } from 'react';
import { APP_NAME } from '@/constants';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
  }, [title]);
}
