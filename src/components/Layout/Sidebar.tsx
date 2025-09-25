import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Images, 
  Album, 
  Search, 
  Calendar, 
  Star, 
  Settings, 
  Menu,
  Upload,
  Heart,
  MapPin,
  Clock
} from 'lucide-react';

const menuItems = [
  { icon: Images, label: 'Photos', path: '/photos' },
  { icon: Album, label: 'Albums', path: '/albums' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Calendar, label: 'Timeline', path: '/timeline' },
  { icon: Star, label: 'Favorites', path: '/favorites' },
  { icon: Heart, label: 'Liked', path: '/liked' },
  { icon: MapPin, label: 'Places', path: '/places' },
  { icon: Clock, label: 'Recent', path: '/recent' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, openUploadModal } = useUIStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold">Photos</h1>
            </motion.div>
          )}
        </div>

        {/* Upload Button */}
        <div className="p-4">
          <Button
            onClick={openUploadModal}
            className="w-full"
            size={sidebarCollapsed ? "icon" : "default"}
          >
            <Upload className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Upload</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center p-3 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </motion.aside>
  );
};