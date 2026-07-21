const fs = require('fs');

// Fix Header.tsx
let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');
headerCode = headerCode.replace(
  "className=\"mt-4 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 flex items-center justify-center gap-2\"",
  "className=\"mt-4 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 flex flex-wrap items-center justify-center gap-2 sm:gap-2\""
);
fs.writeFileSync('src/components/Header.tsx', headerCode);

// Fix Home.tsx (make sure text size and paddings are mobile friendly)
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(
  "text-3xl md:text-5xl",
  "text-3xl md:text-5xl leading-tight"
);
homeCode = homeCode.replace(
  "text-lg md:text-xl",
  "text-base md:text-xl px-2"
);
homeCode = homeCode.replace(
  /grid-cols-1 md:grid-cols-2 lg:grid-cols-4/g,
  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
);
fs.writeFileSync('src/pages/Home.tsx', homeCode);

// Fix AdminDashboard.tsx Tabs wrapper (make them scrollable on mobile)
let adminCode = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
adminCode = adminCode.replace(
  "className=\"flex gap-2\"",
  "className=\"flex gap-2 overflow-x-auto pb-2 -mb-2 w-full\""
);
fs.writeFileSync('src/pages/AdminDashboard.tsx', adminCode);
