
import fs from 'fs';
import path from 'path';

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      if (file !== '.git' && file !== '.vite') {
        search(fullPath);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('fetch =') && content.includes('window')) {
           console.log(`Found in: ${fullPath}`);
           // print the line
           const lines = content.split('\n');
           lines.forEach((line, idx) => {
             if (line.includes('fetch =') && line.includes('window')) {
               console.log(`${idx + 1}: ${line.trim()}`);
             }
           });
        }
      }
    }
  }
}

search('./node_modules');
