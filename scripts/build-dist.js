const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

const distDir = path.join(__dirname, '..', 'dist');
const adminDistDir = path.join(__dirname, '..', 'admin', 'dist');

console.log('Ensuring dist directory exists...');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

console.log('Copying admin build to dist/admin...');
if (fs.existsSync(adminDistDir)) {
    copyRecursiveSync(adminDistDir, path.join(distDir, 'admin'));
} else {
    console.error('Admin dist directory not found! Run admin build first.');
    process.exit(1);
}

console.log('Copying root HTML files to dist...');
const rootFiles = fs.readdirSync(path.join(__dirname, '..'));
rootFiles.forEach(file => {
    if (file.endsWith('.html')) {
        fs.copyFileSync(path.join(__dirname, '..', file), path.join(distDir, file));
    }
});

console.log('Build synchronization complete.');
