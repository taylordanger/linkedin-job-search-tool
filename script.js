// LinkedIn Job Search URL Generator with F_TPR support

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateLinkedInUrl();
});

function generateLinkedInUrl() {
    const baseUrl = 'https://www.linkedin.com/jobs/search/';
    const params = new URLSearchParams();
    
    // Get form values
    const keywords = document.getElementById('keywords').value.trim();
    const location = document.getElementById('location').value.trim();
    const timePosted = document.getElementById('timePosted').value;
    const experienceLevel = Array.from(document.getElementById('experienceLevel').selectedOptions).map(opt => opt.value);
    const jobType = Array.from(document.getElementById('jobType').selectedOptions).map(opt => opt.value);
    const remoteFilter = document.getElementById('remoteFilter').checked;
    const easyApply = document.getElementById('easyApply').checked;
    
    // Build query parameters
    if (keywords) {
        params.append('keywords', keywords);
    }
    
    if (location) {
        params.append('location', location);
    }
    
    // F_TPR parameter for time posted filter
    if (timePosted) {
        params.append('f_TPR', timePosted);
    }
    
    // Experience level filter
    if (experienceLevel.length > 0) {
        params.append('f_E', experienceLevel.join(','));
    }
    
    // Job type filter
    if (jobType.length > 0) {
        params.append('f_JT', jobType.join(','));
    }
    
    // Remote filter
    if (remoteFilter) {
        params.append('f_WT', '2'); // 2 = Remote
    }
    
    // Easy Apply filter
    if (easyApply) {
        params.append('f_AL', 'true');
    }
    
    // Construct final URL
    const finalUrl = baseUrl + '?' + params.toString();
    
    // Display result
    displayResult(finalUrl);
}

function displayResult(url) {
    const resultContainer = document.getElementById('resultContainer');
    const generatedUrl = document.getElementById('generatedUrl');
    
    generatedUrl.value = url;
    resultContainer.style.display = 'block';
    
    // Smooth scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Copy to clipboard functionality
document.getElementById('copyBtn').addEventListener('click', function() {
    const urlInput = document.getElementById('generatedUrl');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(urlInput.value).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        alert('Failed to copy URL. Please copy manually.');
    });
});

// Open in LinkedIn functionality
document.getElementById('openBtn').addEventListener('click', function() {
    const url = document.getElementById('generatedUrl').value;
    window.open(url, '_blank');
});

// Add helpful tooltips and examples
document.addEventListener('DOMContentLoaded', function() {
    // Add example placeholder rotation
    const keywordsInput = document.getElementById('keywords');
    const examples = [
        'Software Engineer',
        'Product Manager',
        'Data Scientist',
        'UX Designer',
        'DevOps Engineer',
        'Marketing Manager'
    ];
    
    let exampleIndex = 0;
    setInterval(() => {
        if (keywordsInput !== document.activeElement && !keywordsInput.value) {
            exampleIndex = (exampleIndex + 1) % examples.length;
            keywordsInput.placeholder = `e.g., ${examples[exampleIndex]}`;
        }
    }, 3000);
});

// F_TPR time calculations helper
function secondsToHumanReadable(seconds) {
    const units = [
        { name: 'day', value: 86400 },
        { name: 'hour', value: 3600 },
        { name: 'minute', value: 60 },
        { name: 'second', value: 1 }
    ];
    
    for (const unit of units) {
        if (seconds >= unit.value) {
            const amount = Math.floor(seconds / unit.value);
            return `${amount} ${unit.name}${amount > 1 ? 's' : ''}`;
        }
    }
    
    return '0 seconds';
}

// Log F_TPR info to console for developers
console.log('%c F_TPR Parameter Info ', 'background: #0073b1; color: white; font-size: 14px; font-weight: bold; padding: 5px;');
console.log('F_TPR values are time ranges in seconds:');
console.log('  r60 = Last minute (60 seconds)');
console.log('  r3600 = Last hour (3,600 seconds)');
console.log('  r86400 = Last 24 hours (86,400 seconds)');
console.log('  r604800 = Last week (604,800 seconds)');
console.log('  r2592000 = Last month (2,592,000 seconds)');
