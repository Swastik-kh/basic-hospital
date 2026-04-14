import https from 'https';

https.get('https://mohp.gov.np/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const lines = data.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('flag') || lines[i].includes('wave') || lines[i].includes('animation') || lines[i].includes('css')) {
        console.log(`Line ${i}: ${lines[i].trim()}`);
      }
    }
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
