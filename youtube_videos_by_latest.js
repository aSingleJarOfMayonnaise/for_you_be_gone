// ==UserScript==
// @name         YouTube Videos by Latest
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically switches to the 'Latest' tab of a YouTube channel's video section. I got really annoyed at it defaulting to 'For You' so I shoved this mess together to fix the problem.
// @author       aSingleJarOfMayonnaise
// @match        *://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

let previousUrl = window.location.href;
let urlChanged = false;

function activateElementWithXPath(attempt) {
  const latest = document.evaluate("/html/body/ytd-app/div[1]/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-rich-grid-renderer/div[1]/ytd-feed-filter-chip-bar-renderer/div/div[3]/iron-selector/yt-chip-cloud-chip-renderer[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  if (latest) {
    latest.click();
    const intervalId = setInterval(() => {
      if (latest.getAttribute('aria-selected') === 'true' && attempt > 1) {
        clearInterval(intervalId);
      } else if (attempt < 500) {
        // Element not activated, wait and try again
        setTimeout(() => activateElementWithXPath(attempt + 1), 500); // Wait for 0.5 seconds and retry
      }
    }, 500); // Check every 0.5 seconds for activation

  } else if (attempt < 100) {
    // Element not found, wait and try again
    setTimeout(() => activateElementWithXPath(attempt + 1), 500); // Wait for 0.5 seconds and retry
  }
}

// Check for URL changes
function checkChanged() {
  if (window.location.href !== previousUrl) {
    previousUrl = window.location.href;
    urlChanged = true;
    handleUrlChange();
  }
}


// Activates this if the URL ends in /videos
function handleUrlChange() {
  if (window.location.href.endsWith('/videos')) {
    activateElementWithXPath(1);
    urlChanged = false;
  }
}

// Create a MutationObserver to monitor DOM changes
const observer = new MutationObserver(() => {
  checkChanged()
  if (urlChanged) {
    handleUrlChange();
  }
});

// Configuration for the MutationObserver
const observerConfig = {
  childList: true,
  subtree: true,
};

// Observe the document and trigger handleUrlChange() on DOM changes
observer.observe(document, observerConfig);

// Check if the initial URL ends with '/videos' and activate the element if necessary
if (window.location.href.endsWith('/videos')) {
  activateElementWithXPath(1);
}
