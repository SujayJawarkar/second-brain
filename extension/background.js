chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveTweet") {
    saveTweetToBackend(request.url)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we will send a response asynchronously
  }
});

async function saveTweetToBackend(tweetUrl) {
  const data = await chrome.storage.local.get(["kortexToken"]);
  const token = data.kortexToken;

  if (!token) {
    throw new Error("User not logged in. Please log in via the extension popup.");
  }

  const baseUrl = "https://second-brain-backend-xqqh.onrender.com";
  // const baseUrl = "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/v1/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ url: tweetUrl })
  });

  const resData = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(resData.error || "Failed to save tweet");
  }

  return { success: true };
}
