import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Study Garden · Sravanthi’s UPSC space',description:'Read deeply. Recall clearly. Return to what matters.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
