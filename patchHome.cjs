const fs = require('fs');

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Fix scaling that breaks mobile view
homeCode = homeCode.replace(
  "scale-105 md:scale-110",
  "scale-100 sm:scale-105 md:scale-110"
);

fs.writeFileSync('src/pages/Home.tsx', homeCode);
