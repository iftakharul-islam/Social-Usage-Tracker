document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['usageData'], (result) => {
      const usageData = result.usageData || {};
      const usageContainer = document.getElementById('usageData');
      
      usageContainer.innerHTML = '';
      for (const [site, seconds] of Object.entries(usageData)) {
        const minutes = Math.floor(seconds / 60);
        usageContainer.innerHTML += `<div class="site">${site}: ${minutes} minutes</div>`;
      }
    });
  });
  
  function resetData() {
    chrome.storage.local.set({ usageData: {} }, () => {
      document.getElementById('usageData').innerHTML = '';
    });
  }
  