#!/bin/bash

# BudgetBee Sitemap Validation Script
# Quick validation of generated sitemap files

echo "🔍 BudgetBee Sitemap Validation"
echo "================================"

# Check if sitemap files exist
if [ -f "dist/sitemap-index.xml" ]; then
    echo "✅ sitemap-index.xml exists"
else
    echo "❌ sitemap-index.xml missing"
    exit 1
fi

if [ -f "dist/sitemap-0.xml" ]; then
    echo "✅ sitemap-0.xml exists"
else
    echo "❌ sitemap-0.xml missing"
    exit 1
fi

# Check file sizes
index_size=$(wc -c < dist/sitemap-index.xml)
main_size=$(wc -c < dist/sitemap-0.xml)

echo ""
echo "📊 File Statistics:"
echo "   sitemap-index.xml: ${index_size} bytes"
echo "   sitemap-0.xml: ${main_size} bytes"

# Count URLs in main sitemap
url_count=$(grep -o "<url>" dist/sitemap-0.xml | wc -l)
echo "   Total URLs: ${url_count}"

# Check for required metadata
lastmod_count=$(grep -c "<lastmod>" dist/sitemap-0.xml)
priority_count=$(grep -c "<priority>" dist/sitemap-0.xml)
changefreq_count=$(grep -c "<changefreq>" dist/sitemap-0.xml)

echo ""
echo "📋 Metadata Coverage:"
echo "   lastmod: ${lastmod_count}/${url_count} URLs"
echo "   priority: ${priority_count}/${url_count} URLs"
echo "   changefreq: ${changefreq_count}/${url_count} URLs"

# Check for high-priority pages
high_priority=$(grep -c "<priority>1.0</priority>" dist/sitemap-0.xml)
med_high_priority=$(grep -c "<priority>0.9</priority>" dist/sitemap-0.xml)

echo ""
echo "🎯 Priority Analysis:"
echo "   Priority 1.0: ${high_priority} pages"
echo "   Priority 0.9: ${med_high_priority} pages"

# Check for daily updates
daily_updates=$(grep -c "<changefreq>daily</changefreq>" dist/sitemap-0.xml)
weekly_updates=$(grep -c "<changefreq>weekly</changefreq>" dist/sitemap-0.xml)
monthly_updates=$(grep -c "<changefreq>monthly</changefreq>" dist/sitemap-0.xml)

echo ""
echo "📅 Update Frequency:"
echo "   Daily: ${daily_updates} pages"
echo "   Weekly: ${weekly_updates} pages"
echo "   Monthly: ${monthly_updates} pages"

# Validate XML structure
echo ""
echo "🔧 XML Validation:"
if command -v xmllint &> /dev/null; then
    if xmllint --noout dist/sitemap-index.xml 2>/dev/null; then
        echo "   ✅ sitemap-index.xml: Valid XML"
    else
        echo "   ❌ sitemap-index.xml: Invalid XML"
    fi

    if xmllint --noout dist/sitemap-0.xml 2>/dev/null; then
        echo "   ✅ sitemap-0.xml: Valid XML"
    else
        echo "   ❌ sitemap-0.xml: Invalid XML"
    fi
else
    echo "   ⚠️  xmllint not available, skipping XML validation"
fi

# Check robots.txt reference
echo ""
echo "🤖 robots.txt Integration:"
if grep -q "sitemap-index.xml" public/robots.txt; then
    echo "   ✅ Sitemap referenced in robots.txt"
else
    echo "   ❌ Sitemap not referenced in robots.txt"
fi

# Sample high-priority URLs
echo ""
echo "⭐ High-Priority URLs (sample):"
grep -A 4 "<priority>1.0</priority>" dist/sitemap-0.xml | grep "<loc>" | head -3 | sed 's/.*<loc>\(.*\)<\/loc>.*/   \1/'
grep -A 4 "<priority>0.9</priority>" dist/sitemap-0.xml | grep "<loc>" | head -3 | sed 's/.*<loc>\(.*\)<\/loc>.*/   \1/'

echo ""
echo "🎉 Validation Complete!"
echo ""
echo "Next Steps:"
echo "1. Submit sitemap to Google Search Console"
echo "2. Monitor indexing status"
echo "3. Update content regularly to match changefreq"
