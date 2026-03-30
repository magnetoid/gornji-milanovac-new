import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => ({
  locale: 'sr',
  messages: (await import('../messages/sr.json')).default
}));
