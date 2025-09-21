const proxyUrl = 'https://api.allorigins.win/get?url=';
const scholarUrl = 'https://scholar.google.com/citations?user=UNchM2kAAAAJ&hl=en';

// Simple cache mechanism
const cache = {};

async function fetchScholarMeta() {
    if (cache[scholarUrl]) {
        return cache[scholarUrl];
    }

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(scholarUrl));
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.contents) {
            throw new Error('Invalid response data');
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        const metaElement = doc.querySelector('meta[name="description"]');
        if (!metaElement) {
            throw new Error('Meta description not found');
        }
        const metaContent = metaElement.getAttribute('content');
        cache[scholarUrl] = metaContent;
        return metaContent;
    } catch (error) {
        console.warn('Scholar fetch failed (non-critical):', error.message);
        return null;
    }
}

function extractCitationCount(metaContent) {
    const match = metaContent.match(/Cited by (\d+)/);
    return match ? match[1] : 'N/A';
}

async function displayCitationCount() {
    const metaContent = await fetchScholarMeta();
    const citationElement = document.getElementById('citation-count');
    
    if (citationElement) {
        if (metaContent) {
            const citationCount = extractCitationCount(metaContent);
            citationElement.textContent = citationCount;
        } else {
            citationElement.textContent = 'N/A';
        }
    }
}

// Initiate the fetch and display process after the page loads
window.addEventListener('load', displayCitationCount);