
import React, { useEffect } from 'react';

/**
 * SilentTracker: Tracks usage without showing anything to the user.
 * To view your logs as the owner:
 * 1. Open DevTools (F12)
 * 2. Console: JSON.parse(localStorage.getItem('_cf_admin_data'))
 */
export const SilentTracker: React.FC = () => {
  useEffect(() => {
    const track = async () => {
      try {
        // 1. Get Public IP
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        const ip = data.ip;

        // 2. Update Hidden Local Logs
        const logs = JSON.parse(localStorage.getItem('_cf_admin_data') || '[]');
        const entry = {
          ip,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        };
        logs.push(entry);
        localStorage.setItem('_cf_admin_data', JSON.stringify(logs.slice(-100))); // Store last 100 entries

      } catch (e) {
        // Silent fail to not disrupt user experience
      }
    };

    track();
  }, []);

  return null; // Invisible component
};
