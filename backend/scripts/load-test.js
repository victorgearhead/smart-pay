
const { execSync } = require('child_process');
const fs = require('fs');

const artilleryConfig = {
  config: {
    target: process.env.API_ENDPOINT || 'https://api.smartpay.dev',
    phases: [
      { duration: 60, arrivalRate: 10, name: 'Warm up' },
      { duration: 120, arrivalRate: 25, name: 'Ramp up load' },
      { duration: 300, arrivalRate: 50, name: 'Sustained load' },
      { duration: 60, arrivalRate: 10, name: 'Cool down' }
    ],
    defaults: {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN}`
      }
    }
  },
  scenarios: [
    {
      name: 'Fraud Detection Flow',
      weight: 40,
      flow: [
        {
          post: {
            url: '/fraud',
            json: {
              transactionId: '{{ $randomString() }}',
              userId: 'user_{{ $randomInt(1, 1000) }}',
              cardId: 'card_{{ $randomString() }}',
              amount: '{{ $randomNumber(10, 5000) }}',
              currency: 'USD',
              merchantId: 'm_{{ $randomInt(1, 100) }}',
              deviceId: 'device_{{ $randomString() }}',
              ipAddress: '{{ $randomIP() }}',
              location: 'Test Location',
              timestamp: '{{ $isoTimestamp() }}',
              previousDeclines: '{{ $randomInt(0, 5) }}',
              velocityLastHour: '{{ $randomInt(1, 20) }}'
            },
            capture: {
              json: '$.riskScore',
              as: 'riskScore'
            }
          }
        }
      ]
    },
    {
      name: 'Payment Routing Flow',
      weight: 30,
      flow: [
        {
          post: {
            url: '/route',
            json: {
              amount: '{{ $randomNumber(10, 5000) }}',
              currency: 'USD',
              riskScore: '{{ riskScore }}',
              merchantType: 'retail',
              region: 'North America'
            }
          }
        }
      ]
    },
    {
      name: 'Full Payment Flow',
      weight: 20,
      flow: [
        {
          post: {
            url: '/pay',
            json: {
              transactionId: '{{ $randomString() }}',
              userId: 'user_{{ $randomInt(1, 1000) }}',
              cardId: 'card_{{ $randomString() }}',
              amount: '{{ $randomNumber(10, 1000) }}',
              currency: 'USD',
              merchantId: 'm_{{ $randomInt(1, 100) }}',
              deviceId: 'device_{{ $randomString() }}',
              ipAddress: '{{ $randomIP() }}',
              location: 'Test Location',
              timestamp: '{{ $isoTimestamp() }}',
              previousDeclines: 0,
              velocityLastHour: 1
            }
          }
        }
      ]
    },
    {
      name: 'Chat Queries',
      weight: 10,
      flow: [
        {
          post: {
            url: '/chat',
            json: {
              userId: 'user_{{ $randomInt(1, 1000) }}',
              query: 'Why was my payment declined?'
            }
          }
        }
      ]
    }
  ]
};

fs.writeFileSync('load-test.yml', `# Artillery Load Test Configuration
${JSON.stringify(artilleryConfig, null, 2).replace(/"/g, '').replace(/,/g, '')}
`);

console.log('🚀 Starting load test...');
console.log('Target:', artilleryConfig.config.target);
console.log('Total duration: ~8 minutes');
console.log('Peak rate: 50 requests/second');

try {
  execSync('npx artillery run load-test.yml --output load-test-report.json', { 
    stdio: 'inherit' 
  });
  
  execSync('npx artillery report load-test-report.json --output load-test-report.html', { 
    stdio: 'inherit' 
  });
  
  console.log('✅ Load test completed!');
  console.log('📊 Report generated: load-test-report.html');
  
} catch (error) {
  console.error('❌ Load test failed:', error.message);
  process.exit(1);
}
