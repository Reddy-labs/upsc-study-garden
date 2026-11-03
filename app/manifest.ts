import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'UPSC Study Garden', short_name: 'Study Garden',
    description: 'Your UPSC notes, PYQs, essay classroom and revision space.',
    start_url: '/', scope: '/', display: 'standalone',
    background_color: '#f8f9f5', theme_color: '#264d40', lang: 'en-IN',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Essay classroom', url: '/#essay-classroom' },
      { name: 'International Relations', url: '/#gs2-ir' },
    ],
  };
}
