async function fetchCitationNumber() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://scholar.google.com/citations?user=UNchM2kAAAAJ&hl=en';
    const response = await fetch(proxyUrl + targetUrl);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Find the element containing the citation number on Google Scholar
    const citationNumberElement = doc.querySelector('td.gsc_rsb_std');
    const citationNumber = citationNumberElement.textContent;

    // Update the citation number container on your personal HTML page
    const citationNumberContainer = document.querySelector('#citation-number-container');
    citationNumberContainer.textContent = citationNumber;
}

fetchCitationNumber();