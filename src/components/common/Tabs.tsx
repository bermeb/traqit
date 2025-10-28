/**
 * Tabs Component
 * Reusable tabbed interface
 */

import { ReactNode } from 'react';
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
      <div className="tabs__content">
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
