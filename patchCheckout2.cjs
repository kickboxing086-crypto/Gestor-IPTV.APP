const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

code = code.replace(
  "navigate(`/success/${sub.id}`);",
  "navigate(`/${storeSlug}/success/${sub.id}`);"
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
