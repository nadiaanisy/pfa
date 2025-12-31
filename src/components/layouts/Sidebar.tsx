import {
  motion,
  AnimatePresence
} from 'motion/react';
import React from 'react';
import { X } from 'lucide-react';
import { MENU_ITEMS } from '../../misc/constants';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  onLogout
}) => {
  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => {
              if (!isDesktop()) onClose();
            }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border/50 z-40 md:static md:translate-x-0"
      >
        <div className="p-6 border-b border-border/50 flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A8D5BA] to-[#B4A7D6] rounded-xl flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <h2 className="font-semibold">ExpenseTracker</h2>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>
          <button onClick={() => { if (!isDesktop()) onClose()}} className="md:hidden w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLogout = item.id === 'logout';

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLogout) {
                    onLogout();
                    if (!isDesktop()) onClose();
                    return;
                  }

                  onTabChange(item.id);
                  if (!isDesktop()) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A8D5BA]/20 to-[#B4A7D6]/20 text-primary border border-primary/20'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${ isLogout ? 'text-red-500' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 md:w-72">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 md:w-[16rem]">
            <h4 className="font-medium mb-1">Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Track expenses daily to maintain your streak and unlock achievements!
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};