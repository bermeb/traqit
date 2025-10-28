/**
 * Tabs Component
 * Reusable tabbed interface with swipe support
 */

import { ReactNode, useState, useRef, TouchEvent } from 'react';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTabId, onTabChange, className = '' }: TabsProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);

      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        // Swipe left -> next tab
        onTabChange(tabs[currentIndex + 1].id);
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe right -> previous tab
        onTabChange(tabs[currentIndex - 1].id);
      }
    }
  };

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs__header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tabs__tab ${activeTabId === tab.id ? 'tabs__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.icon && <span className="tabs__icon">{tab.icon}</span>}
            <span className="tabs__label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div
        className="tabs__content"
        ref={contentRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tabs__panel ${activeTabId === tab.id ? 'tabs__panel--active' : ''}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
