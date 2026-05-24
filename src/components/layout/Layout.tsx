import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'motion/react';

export function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-black text-white font-sans min-h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="flex-1 p-6 lg:p-10 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Footer Info Bar */}
        <footer className="px-10 h-12 flex items-center justify-between border-t border-white/5 bg-black/40 text-[10px] text-white/20 uppercase tracking-[0.3em] w-full backdrop-blur-sm mt-auto shrink-0">
          <div className="flex space-x-6">
            <span>Protocol v2.1.0</span>
            <span>Uptime 99.98%</span>
          </div>
          <div className="flex space-x-6">
            <span className="text-brand/40 italic">Last Sync: 2 min ago</span>
            <span>Terms of Protocol</span>
          </div>
        </footer>
      </main>
      
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-brand/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
