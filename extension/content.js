// content.js
console.log("Kortex content script loaded on Twitter/X");

const KORTEX_ICON = `<svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="currentColor">
  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2v2H8v-2H6v-2h2V8h2v2h2v2zm4 4h-8v-2h8v2z" />
</svg>`;

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
    } catch(e) {}

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
