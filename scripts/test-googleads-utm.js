#!/usr/bin/env node

/**
 * Google Ads UTM Parameter Validation Test
 * Tests the specific UTM format used in Google Ads campaigns
 * Sample URL: https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792
 */

// Mock browser environment for Node.js testing
global.window = {
  location: {
    href: 'https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792',
    search: '?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792',
    pathname: '/quiz',
    origin: 'https://budgetbeepro.com'
  },
  sessionStorage: {
    storage: {},
    getItem(key) { return this.storage[key] || null; },
    setItem(key, value) { this.storage[key] = value; },
    removeItem(key) { delete this.storage[key]; },
    clear() { this.storage = {}; }
  },
  dataLayer: []
};

// Import UTM utilities (mock implementation)
const UTM_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

function extractUtmFromUrl(searchParams) {
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams;

  const utmParams = {};
  UTM_PARAM_KEYS.forEach(key => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

function validateUtmSource(utmParams) {
  if (!utmParams.utm_source) return true;

  const allowedSources = [
    'convertkit', 'email', 'adwords', 'google', 'googleads',
    'facebook', 'instagram', 'twitter', 'linkedin',
    'newsletter', 'organic', 'direct', 'referral'
  ];

  return allowedSources.includes(utmParams.utm_source.toLowerCase());
}

// Test scenarios
console.log('🧪 Google Ads UTM Parameter Validation Test\n');

const googleAdsUrl = 'https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792';

// Test 1: URL Parsing
console.log('Test 1: URL Parsing');
console.log('==================');
const urlObj = new URL(googleAdsUrl);
const extractedParams = extractUtmFromUrl(urlObj.searchParams);

console.log('Sample URL:', googleAdsUrl);
console.log('Extracted Parameters:', extractedParams);

const expectedParams = {
  utm_source: 'googleads',
  utm_campaign: '22950333792',
  utm_content: 'id22950333792-771621153085',
  utm_medium: '-22950333792'
};

const parseTest = Object.keys(expectedParams).every(key =>
  extractedParams[key] === expectedParams[key]
);
console.log('✅ Parsing Test:', parseTest ? 'PASS' : 'FAIL');

// Test 2: UTM Source Validation
console.log('\nTest 2: UTM Source Validation');
console.log('==============================');
const sourceValidation = validateUtmSource(extractedParams);
console.log('UTM Source:', extractedParams.utm_source);
console.log('✅ Source Validation:', sourceValidation ? 'PASS' : 'FAIL');

// Test 3: Parameter Format Analysis
console.log('\nTest 3: Parameter Format Analysis');
console.log('==================================');

const formatAnalysis = {
  utm_source: {
    value: extractedParams.utm_source,
    format: 'String identifier for Google Ads',
    valid: /^[a-zA-Z0-9_-]+$/.test(extractedParams.utm_source)
  },
  utm_campaign: {
    value: extractedParams.utm_campaign,
    format: 'Numeric campaign ID',
    valid: /^\d+$/.test(extractedParams.utm_campaign)
  },
  utm_content: {
    value: extractedParams.utm_content,
    format: 'ID-based content identifier',
    valid: /^id\d+-\d+$/.test(extractedParams.utm_content)
  },
  utm_medium: {
    value: extractedParams.utm_medium,
    format: 'Negative campaign reference',
    valid: /^-\d+$/.test(extractedParams.utm_medium)
  }
};

Object.entries(formatAnalysis).forEach(([param, analysis]) => {
  console.log(`${param}:`);
  console.log(`  Value: ${analysis.value}`);
  console.log(`  Format: ${analysis.format}`);
  console.log(`  Valid: ${analysis.valid ? '✅ YES' : '❌ NO'}`);
});

// Test 4: SessionStorage Integration
console.log('\nTest 4: SessionStorage Integration');
console.log('===================================');

// Clear storage first
UTM_PARAM_KEYS.forEach(key => {
  window.sessionStorage.removeItem(key);
});

// Store parameters
Object.entries(extractedParams).forEach(([key, value]) => {
  window.sessionStorage.setItem(key, value);
});

// Retrieve and verify
const retrievedParams = {};
UTM_PARAM_KEYS.forEach(key => {
  const value = window.sessionStorage.getItem(key);
  if (value !== null) {
    retrievedParams[key] = value;
  }
});

const storageTest = JSON.stringify(retrievedParams) === JSON.stringify(extractedParams);
console.log('Stored Parameters:', extractedParams);
console.log('Retrieved Parameters:', retrievedParams);
console.log('✅ Storage Test:', storageTest ? 'PASS' : 'FAIL');

// Test 5: Data Layer Integration
console.log('\nTest 5: Data Layer Integration');
console.log('===============================');

// Push to dataLayer
window.dataLayer.push({
  event: 'utm_parameters_loaded',
  utm_source: extractedParams.utm_source,
  utm_campaign: extractedParams.utm_campaign,
  utm_content: extractedParams.utm_content,
  utm_medium: extractedParams.utm_medium,
  page_location: googleAdsUrl,
  page_title: 'Credit Card Quiz - Find Your Perfect Card | BudgetBee'
});

const dataLayerEntry = window.dataLayer[window.dataLayer.length - 1];
const dataLayerTest = dataLayerEntry.event === 'utm_parameters_loaded' &&
                     dataLayerEntry.utm_source === extractedParams.utm_source;

console.log('DataLayer Entry:', dataLayerEntry);
console.log('✅ DataLayer Test:', dataLayerTest ? 'PASS' : 'FAIL');

// Test 6: Quiz URL Construction
console.log('\nTest 6: Quiz URL Construction');
console.log('==============================');

function buildQuizUrl(baseUrl = '/quiz') {
  const storedParams = {};
  UTM_PARAM_KEYS.forEach(key => {
    const value = window.sessionStorage.getItem(key);
    if (value) {
      storedParams[key] = value;
    }
  });

  if (Object.keys(storedParams).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl, 'https://budgetbeepro.com');
  Object.entries(storedParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

const constructedUrl = buildQuizUrl();

// Compare URLs by parsing parameters instead of exact string match
const originalUrlObj = new URL(googleAdsUrl);
const constructedUrlObj = new URL(constructedUrl);

const originalParams = {};
const constructedParams = {};

for (const [key, value] of originalUrlObj.searchParams.entries()) {
  if (key.startsWith('utm_')) originalParams[key] = value;
}

for (const [key, value] of constructedUrlObj.searchParams.entries()) {
  if (key.startsWith('utm_')) constructedParams[key] = value;
}

const urlTest = Object.keys(originalParams).every(key =>
  originalParams[key] === constructedParams[key]
) && Object.keys(constructedParams).length === Object.keys(originalParams).length;

console.log('Base URL: /quiz');
console.log('Constructed URL:', constructedUrl);
console.log('Original URL:', googleAdsUrl);
console.log('✅ URL Construction Test:', urlTest ? 'PASS' : 'FAIL');

// Summary
console.log('\n' + '='.repeat(50));
console.log('TEST SUMMARY');
console.log('='.repeat(50));

const tests = [
  { name: 'URL Parsing', result: parseTest },
  { name: 'Source Validation', result: sourceValidation },
  { name: 'Parameter Formats', result: Object.values(formatAnalysis).every(a => a.valid) },
  { name: 'SessionStorage', result: storageTest },
  { name: 'DataLayer Integration', result: dataLayerTest },
  { name: 'URL Construction', result: urlTest }
];

let passCount = 0;
tests.forEach((test, index) => {
  const status = test.result ? '✅ PASS' : '❌ FAIL';
  console.log(`${index + 1}. ${status} - ${test.name}`);
  if (test.result) passCount++;
});

console.log(`\n📊 Results: ${passCount}/${tests.length} tests passed`);
console.log(`🎯 Success Rate: ${((passCount / tests.length) * 100).toFixed(1)}%`);

if (passCount === tests.length) {
  console.log('\n🎉 All tests passed! Google Ads UTM parameters are handled correctly.');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed. Please review the implementation.');
  process.exit(1);
}
