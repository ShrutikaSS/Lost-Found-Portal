import { runMatchingEngine } from '../services/matchingEngine.js';

export function initMatchWorker() {
  console.log('🔄 Initializing Background Automated Matching Worker (Runs every 5 mins)...');
  
  // Run once on server startup after short delay
  setTimeout(() => {
    try {
      runMatchingEngine();
    } catch (e) {
      console.error('Error in initial match worker run:', e);
    }
  }, 10000);

  // Interval timer (5 minutes = 300,000 ms)
  setInterval(() => {
    try {
      runMatchingEngine();
    } catch (e) {
      console.error('Error in background match worker execution:', e);
    }
  }, 300000);
}
