// content.js
console.log("Kortex content script loaded on Twitter/X");

const KORTEX_ICON = `<?xml version="1.0" encoding="UTF-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="17"><path d="M0 0 C5.28 0 10.56 0 16 0 C16 5.61 16 11.22 16 17 C10.72 17 5.44 17 0 17 C0 11.39 0 5.78 0 0 Z " fill="#AD724B" transform="translate(0,0)"/><path d="M0 0 C3.3 0 6.6 0 10 0 C10 5.61 10 11.22 10 17 C4.72 17 -0.56 17 -6 17 C-6 16.34 -6 15.68 -6 15 C-4.02 15 -2.04 15 0 15 C0.103125 14.360625 0.20625 13.72125 0.3125 13.0625 C0.539375 12.381875 0.76625 11.70125 1 11 C1.99 10.67 2.98 10.34 4 10 C5.45644757 7.91187542 5.45644757 7.91187542 6.6875 5.4375 C7.12449219 4.61121094 7.56148437 3.78492188 8.01171875 2.93359375 C8.33785156 2.29550781 8.66398438 1.65742188 9 1 C4.58477891 2.26974972 4.58477891 2.26974972 1 5 C0.67 3.35 0.34 1.7 0 0 Z " fill="#78645B" transform="translate(6,0)"/><path d="M0 0 C3.3 0 6.6 0 10 0 C10 4.95 10 9.9 10 15 C6 11 6 11 5.5625 8.5625 C6.08412878 5.5072457 7.25855285 3.53961042 9 1 C4.58477891 2.26974972 4.58477891 2.26974972 1 5 C0.67 3.35 0.34 1.7 0 0 Z " fill="#F0F1F1" transform="translate(6,0)"/><path d="M0 0 C1.98 0 3.96 0 6 0 C5.67 1.65 5.34 3.3 5 5 C3.0625 5.5625 3.0625 5.5625 1 6 C0 5 0 5 -0.0625 2.4375 C-0.041875 1.633125 -0.02125 0.82875 0 0 Z " fill="#41484F" transform="translate(1,1)"/><path d="M0 0 C1.2065625 0.0309375 1.2065625 0.0309375 2.4375 0.0625 C1.10416667 3.39583333 -0.22916667 6.72916667 -1.5625 10.0625 C-2.8825 9.7325 -4.2025 9.4025 -5.5625 9.0625 C-3.9125 6.7525 -2.2625 4.4425 -0.5625 2.0625 C-1.5525 1.7325 -2.5425 1.4025 -3.5625 1.0625 C-2.5625 0.0625 -2.5625 0.0625 0 0 Z " fill="#575250" transform="translate(12.5625,0.9375)"/><path d="M0 0 C1.98 0 3.96 0 6 0 C5.67 1.65 5.34 3.3 5 5 C2.03 4.505 2.03 4.505 -1 4 C-0.67 2.68 -0.34 1.36 0 0 Z " fill="#494C52" transform="translate(1,11)"/><path d="M0 0 C1.5 1.375 1.5 1.375 3 3 C3 3.66 3 4.32 3 5 C-0.3 5 -3.6 5 -7 5 C-7 4.34 -7 3.68 -7 3 C-5.02 3 -3.04 3 -1 3 C-0.67 2.01 -0.34 1.02 0 0 Z " fill="#E4E3E3" transform="translate(7,12)"/><path d="M0 0 C3.3 0 6.6 0 10 0 C9.67 0.66 9.34 1.32 9 2 C8.236875 1.938125 7.47375 1.87625 6.6875 1.8125 C3.95474688 1.74101915 3.95474688 1.74101915 2.1875 3.5 C1.795625 3.995 1.40375 4.49 1 5 C0.67 3.35 0.34 1.7 0 0 Z " fill="#D4D5D5" transform="translate(6,0)"/></svg>`;

function injectKortexButton() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');

  tweets.forEach(tweet => {
    // Skip if already injected
    if (tweet.querySelector('.kortex-save-btn')) return;

    // The action bar
    const actionBar = tweet.querySelector('div[role="group"]');
    if (!actionBar) return;

    // Find tweet url (using the timestamp link)
    const timeLink = Array.from(tweet.querySelectorAll('a')).find(a => a.href.includes('/status/'));
    if (!timeLink) return;

    let tweetUrl = timeLink.href;
    // Strip analytics/tracking params if any
    try {
      const urlObj = new URL(tweetUrl);
      tweetUrl = urlObj.origin + urlObj.pathname;
    } catch (e) { }

    const btnContainer = document.createElement('div');
    btnContainer.className = "kortex-save-btn";
    btnContainer.style.display = "flex";
    btnContainer.style.alignItems = "center";
    btnContainer.style.justifyContent = "center";
    btnContainer.style.cursor = "pointer";
    btnContainer.style.padding = "0 8px";
    btnContainer.style.color = "rgb(113, 118, 123)";
    btnContainer.style.transition = "color 0.2s ease";
    btnContainer.title = "Save to Kortex";

    btnContainer.innerHTML = KORTEX_ICON;

    btnContainer.addEventListener('mouseenter', () => {
      btnContainer.style.color = "#1d9bf0";
    });
    btnContainer.addEventListener('mouseleave', () => {
      btnContainer.style.color = "rgb(113, 118, 123)";
    });

    btnContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      btnContainer.style.opacity = "0.5";

      chrome.runtime.sendMessage({ action: "saveTweet", url: tweetUrl }, (response) => {
        btnContainer.style.opacity = "1";
        if (response && response.success) {
          const originalColor = btnContainer.style.color;
          btnContainer.style.color = "rgb(0, 186, 124)"; // success green
          setTimeout(() => btnContainer.style.color = originalColor, 2000);
        } else {
          const originalColor = btnContainer.style.color;
          btnContainer.style.color = "rgb(244, 33, 46)"; // error red
          alert("Failed to save to Kortex: " + (response ? response.error : "Unknown error"));
          setTimeout(() => btnContainer.style.color = originalColor, 2000);
        }
      });
    });

    actionBar.appendChild(btnContainer);
  });
}

// Observe DOM mutations to inject button into new tweets as they load
const observer = new MutationObserver(() => injectKortexButton());
observer.observe(document.body, { childList: true, subtree: true });

// Run once immediately
injectKortexButton();
