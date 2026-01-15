// LinkedIn Job Search URL Generator with F_TPR support
// Backend API Configuration
const API_URL = 'https://linkedin-job-search-tool-production.up.railway.app';

// Stripe Configuration (will be fetched from backend)
let stripe;

// Premium status (in production, check this from your backend/database)
let isPremiumUser = false;

// Current selected platform
let currentPlatform = 'linkedin';

// Initialize Stripe with key from backend
fetch(`${API_URL}/config`)
    .then(response => response.json())
    .then(data => {
        stripe = Stripe(data.publishableKey);
        console.log('Stripe initialized successfully');
    })
    .catch(error => {
        console.error('Failed to initialize Stripe:', error);
    });

// Platform tab switching
document.addEventListener('DOMContentLoaded', function() {
    const platformTabs = document.querySelectorAll('.platform-tab');
    
    platformTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            platformTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            // Update current platform
            currentPlatform = this.dataset.platform;
            // Update form visibility
            updateFormForPlatform(currentPlatform);
        });
    });
    
    // Check premium status from localStorage
    isPremiumUser = localStorage.getItem('isPremium') === 'true';
    
    if (isPremiumUser) {
        enablePremiumFeatures();
        hideAds();
    }
    
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

// Update form fields based on platform
function updateFormForPlatform(platform) {
    const timePostedGroup = document.getElementById('timePosted').closest('.form-group');
    const datePostedGroup = document.getElementById('datePostedGroup');
    
    if (platform === 'linkedin') {
        timePostedGroup.style.display = 'block';
        datePostedGroup.style.display = 'none';
    } else {
        timePostedGroup.style.display = 'none';
        datePostedGroup.style.display = 'block';
    }
}

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateLinkedInUrl();
});

function generateLinkedInUrl() {
    switch(currentPlatform) {
        case 'linkedin':
            return generateLinkedInURL();
        case 'indeed':
            return generateIndeedURL();
        case 'ziprecruiter':
            return generateZipRecruiterURL();
        case 'glassdoor':
            return generateGlassdoorURL();
        default:
            return generateLinkedInURL();
    }
}

function generateLinkedInURL() {
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
    return baseUrl + '?' + params.toString();
}

function generateIndeedURL() {
    const baseUrl = 'https://www.indeed.com/jobs';
    const params = new URLSearchParams();
    
    const keywords = document.getElementById('keywords').value.trim();
    const location = document.getElementById('location').value.trim();
    const datePosted = document.getElementById('datePosted').value;
    const remoteFilter = document.getElementById('remoteFilter').checked;
    
    if (keywords) {
        params.append('q', keywords);
    }
    
    if (location) {
        params.append('l', location);
    }
    
    if (datePosted) {
        params.append('fromage', datePosted);
    }
    
    if (remoteFilter) {
        params.append('remotejob', '1');
    }
    
    // Add affiliate parameter if available
    // params.append('from', 'YOUR_AFFILIATE_ID');
    
    return baseUrl + '?' + params.toString();
}

function generateZipRecruiterURL() {
    const baseUrl = 'https://www.ziprecruiter.com/jobs-search';
    const params = new URLSearchParams();
    
    const keywords = document.getElementById('keywords').value.trim();
    const location = document.getElementById('location').value.trim();
    const datePosted = document.getElementById('datePosted').value;
    const remoteFilter = document.getElementById('remoteFilter').checked;
    
    if (keywords) {
        params.append('search', keywords);
    }
    
    if (location) {
        params.append('location', location);
    }
    
    if (datePosted) {
        params.append('days', datePosted);
    }
    
    if (remoteFilter) {
        params.append('refine_by_location_type', 'remote');
    }
    
    // Add affiliate parameter if available
    // params.append('affiliate_id', 'YOUR_AFFILIATE_ID');
    
    return baseUrl + '?' + params.toString();
}

function generateGlassdoorURL() {
    const baseUrl = 'https://www.glassdoor.com/Job/jobs.htm';
    const params = new URLSearchParams();
    
    const keywords = document.getElementById('keywords').value.trim();
    const location = document.getElementById('location').value.trim();
    const datePosted = document.getElementById('datePosted').value;
    const remoteFilter = document.getElementById('remoteFilter').checked;
    
    if (keywords) {
        params.append('sc.keyword', keywords);
    }
    
    if (location) {
        params.append('locT', 'C');
        params.append('locId', location);
    }
    
    if (datePosted) {
        params.append('fromAge', datePosted);
    }
    
    if (remoteFilter) {
        params.append('remoteWorkType', '1');
    }
    
    return baseUrl + '?' + params.toString();
}

function displayResult(url) {
    const resultContainer = document.getElementById('resultContainer');
    const generatedUrl = document.getElementById('generatedUrl');
    
    generatedUrl.value = url;
    resultContainer.style.display = 'block';
    
    // Update platform name in result
    const platformNames = {
        'linkedin': 'LinkedIn',
        'indeed': 'Indeed',
        'ziprecruiter': 'ZipRecruiter',
        'glassdoor': 'Glassdoor'
    };
    
    const resultTitle = resultContainer.querySelector('h2');
    resultTitle.textContent = `Generated ${platformNames[currentPlatform]} URL`;
    
    // Smooth scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Open in correct platform
document.getElementById('openBtn').addEventListener('click', function() {
    const url = document.getElementById('generatedUrl').value;
    window.open(url, '_blank');
});

// Generate URL and display result
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const url = generateLinkedInUrl();
    displayResult(url);
});

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

// Log F_TPR info to console for developers
console.log('%c Multi-Platform Job Search URL Generator ', 'background: #0073b1; color: white; font-size: 14px; font-weight: bold; padding: 5px;');
console.log('Supported platforms:');
console.log('  - LinkedIn (with F_TPR parameter)');
console.log('  - Indeed');
console.log('  - ZipRecruiter');
console.log('  - Glassdoor');

// Open in LinkedIn functionality
document.getElementById('openBtn').addEventListener('click', function() {
    const url = document.getElementById('generatedUrl').value;
    window.open(url, '_blank');
});

// Add helpful tooltips and examples
// (Already in DOMContentLoaded above)

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

// Premium Features
function enablePremiumFeatures() {
    // Enable all premium inputs
    document.querySelectorAll('.premium-feature select, .premium-feature input').forEach(el => {
        el.disabled = false;
    });
    
    // Hide premium badges
    document.querySelectorAll('.premium-badge').forEach(badge => {
        badge.style.display = 'none';
    });
    
    // Update upgrade button
    const upgradeBtn = document.getElementById('upgradeToPremium');
    upgradeBtn.textContent = '✓ Premium Active';
    upgradeBtn.style.background = '#33ff33';
    upgradeBtn.style.color = '#000000';
    upgradeBtn.style.cursor = 'default';
    upgradeBtn.disabled = true;
}

function hideAds() {
    document.querySelectorAll('.ad-container, .ad-sidebar, .affiliate-box').forEach(ad => {
        ad.style.display = 'none';
    });
}

// Modal functionality
const modal = document.getElementById('premiumModal');
const upgradeBtn = document.getElementById('upgradeToPremium');
const closeBtn = document.querySelector('.close');
const checkoutBtn = document.getElementById('checkoutBtn');

upgradeBtn.addEventListener('click', function() {
    if (!isPremiumUser) {
        modal.style.display = 'block';
    }
});

closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Stripe Checkout
checkoutBtn.addEventListener('click', async function() {
    try {
        if (!stripe) {
            alert('Payment system is initializing. Please try again in a moment.');
            return;
        }
        
        // Call your backend to create a Stripe Checkout Session
        const response = await fetch(`${API_URL}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerEmail: prompt('Enter your email for the receipt:') || undefined
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });
        
        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to start checkout. Please make sure the backend is running and try again.');
    }
});

// Handle premium feature clicks (show upgrade modal)
document.querySelectorAll('.premium-feature select, .premium-feature input').forEach(el => {
    el.addEventListener('click', function(e) {
        if (!isPremiumUser && el.disabled) {
            e.preventDefault();
            modal.style.display = 'block';
        }
    });
});
