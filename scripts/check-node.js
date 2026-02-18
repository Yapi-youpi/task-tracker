const [major, minor] = process.version.slice(1).split('.').map(Number);
const ok = major > 18 || (major === 18 && minor >= 19);
if (!ok) {
  console.error('\n\u274c Требуется Node.js 18.19 или новее. Сейчас: ' + process.version);
  console.error('\nВарианты:');
  console.error('  1. Если установлен nvm:  nvm install 18  &&  nvm use 18');
  console.error('  2. Скачать Node 18+ с https://nodejs.org/\n');
  process.exit(1);
}
