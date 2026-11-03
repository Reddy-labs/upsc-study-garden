import type { Metadata, Viewport } from 'next';
import './globals.css';
import './international-relations.css';
export const metadata:Metadata={title:'Study Garden · Sravanthi’s UPSC space',description:'Read deeply. Recall clearly. Return to what matters.',manifest:'/manifest.webmanifest',applicationName:'UPSC Study Garden',appleWebApp:{capable:true,title:'Study Garden',statusBarStyle:'default'},icons:{icon:'/favicon.svg',apple:'/icons/apple-touch-icon.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#264d40'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
