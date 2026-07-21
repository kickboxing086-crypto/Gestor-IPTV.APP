const fs = require('fs');
let code = fs.readFileSync('src/pages/Success.tsx', 'utf8');

code = code.replace(
  "export default function Success() {",
  "export default function Success() {\n  const { storeSlug } = useParams();"
);

code = code.replace(
  "to=\"/status\"",
  "to={storeSlug ? `/${storeSlug}/status` : '/status'}"
);

code = code.replace(
  "to=\"/\"",
  "to={storeSlug ? `/${storeSlug}` : '/'}"
);

fs.writeFileSync('src/pages/Success.tsx', code);
