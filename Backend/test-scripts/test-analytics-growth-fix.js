#!/usr/bin/env node

/**
 * Test Analytics Growth Calculation Fix
 * This script tests the new growth percentage calculation logic
 */

console.log('🧪 Testing Analytics Growth Calculation Fix\n');

// Test the calculation logic
function calculateGrowthPercentage(currentPeriod, previousPeriod) {
  if (previousPeriod === 0) {
    // If there were no items in previous period but there are now, return 100% growth
    return currentPeriod > 0 ? 100 : 0;
  }
  return Number((((currentPeriod - previousPeriod) / previousPeriod) * 100).toFixed(1));
}

// Test cases
const testCases = [
  {
    name: 'Growth from 10 to 15 users',
    current: 15,
    previous: 10,
    expected: 50.0
  },
  {
    name: 'Decline from 20 to 15 users',
    current: 15,
    previous: 20,
    expected: -25.0
  },
  {
    name: 'No change (10 to 10)',
    current: 10,
    previous: 10,
    expected: 0
  },
  {
    name: 'Growth from 0 to 10 (new data)',
    current: 10,
    previous: 0,
    expected: 100
  },
  {
    name: 'No activity (0 to 0)',
    current: 0,
    previous: 0,
    expected: 0
  },
  {
    name: 'Doubling (5 to 10)',
    current: 10,
    previous: 5,
    expected: 100.0
  },
  {
    name: 'Small growth (100 to 105)',
    current: 105,
    previous: 100,
    expected: 5.0
  }
];

console.log('Running test cases:\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = calculateGrowthPercentage(test.current, test.previous);
  const isPass = result === test.expected;

  if (isPass) {
    console.log(`✅ Test ${index + 1}: ${test.name}`);
    console.log(`   Current: ${test.current}, Previous: ${test.previous}`);
    console.log(`   Result: ${result}% (Expected: ${test.expected}%)\n`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Current: ${test.current}, Previous: ${test.previous}`);
    console.log(`   Result: ${result}% (Expected: ${test.expected}%)\n`);
    failed++;
  }
});

console.log('\n📊 Test Summary:');
console.log(`   Total: ${testCases.length}`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All tests passed! The growth calculation logic is working correctly.');
} else {
  console.log(`\n❌ ${failed} test(s) failed. Please review the calculation logic.`);
  process.exit(1);
}

console.log('\n📝 Explanation of the fix:');
console.log('   OLD METHOD: (new items in period / total items) × 100');
console.log('   - Problem: Shows percentage of total, not actual growth');
console.log('   - Example: 21 new users / 21 total = 100% (misleading)');
console.log('');
console.log('   NEW METHOD: ((current period - previous period) / previous period) × 100');
console.log('   - Correct: Compares current period with previous period');
console.log('   - Example: 15 users now vs 10 users before = +50% growth');
console.log('');
console.log('   Period Comparison:');
console.log('   - Last 30 days: Compare with the 30 days before that');
console.log('   - Last 7 days: Compare with the 7 days before that');
console.log('   - And so on...');

