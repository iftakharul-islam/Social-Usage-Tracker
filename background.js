let usageData = {};
let activeSite = null;
let activeTabId = null;
let timer = null;

// List of social media sites to track
const socialMediaSites = [
  "facebook.com",
  "twitter.com",
  "linkedin.com",
  "instagram.com",
  "youtube.com"
];

// Start tracking time for the active tab
function startTracking(site) {
  if (timer) clearInterval(timer);
    
  timer = setInterval(() => {
    if (!usageData[site]) {
      usageData[site] = 0;
    }
    usageData[site] += 1; // Increment time in seconds
    chrome.storage.local.set({ usageData });
    checkLimits(site)
  }, 1000);
}

// Stop tracking time for the active tab
function stopTracking() {
  if (timer) clearInterval(timer);
}

// Check if the current tab is a social media site
function isSocialMediaSite(url) {
  return socialMediaSites.some(site => url.includes(site));
}

// Listen for tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  const url = tab.url || "";
  
  // Stop tracking the previous site
  if (activeSite) {
    stopTracking();
  }

  // Start tracking the new site if it's a social media site
  if (isSocialMediaSite(url)) {
    activeSite = socialMediaSites.find(site => url.includes(site));
    activeTabId = activeInfo.tabId;
    startTracking(activeSite);
  } else {
    activeSite = null;
    activeTabId = null;
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = tab.url || "";
  
  // If the active tab is updated to a new site
  if (tabId === activeTabId && activeSite && !isSocialMediaSite(url)) {
    stopTracking();
    activeSite = null;
    activeTabId = null;
  }
});

// Listen for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ usageData: {} });
});



const usageLimits = {
    "facebook.com": 60, // 30 minutes
    "twitter.com": 3 * 60,  // 20 minutes
    "yotube.com": 60,  // 20 minutes
    // Add limits for other sites as needed
  };
  
  // Check limits
  function checkLimits(site) {
    if (usageData[site] >= usageLimits[site]) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.jpeg",
        title: "Time Limit Reached",
        message: `You've reached your daily limit for ${site}.`
      });
      stopTracking();
    }
  }