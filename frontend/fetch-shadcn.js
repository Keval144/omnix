const fs = require('fs');
const path = require('path');
const https = require('https');

const components = [
  'sidebar', 'avatar', 'breadcrumb', 'scroll-area', 
  'textarea', 'sheet', 'tooltip', 'skeleton'
];

const basePath = path.join(__dirname, 'components', 'shadcn-ui');

async function fetchComponent(name) {
  return new Promise((resolve, reject) => {
    https.get(`https://ui.shadcn.com/r/styles/default/${name}.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  for (const comp of components) {
    console.log(`Fetching ${comp}...`);
    try {
      const data = await fetchComponent(comp);
      if (data && data.files) {
        for (const file of data.files) {
          if (file.type === 'registry:ui') {
            const destPath = path.join(basePath, file.path);
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(destPath, file.content);
            console.log(`Wrote ${destPath}`);
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching ${comp}:`, e.message);
    }
  }
}

main();
