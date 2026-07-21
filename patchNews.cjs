const fs = require('fs');
let code = fs.readFileSync('src/pages/News.tsx', 'utf8');

code = code.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link, useParams } from 'react-router-dom';"
);

code = code.replace(
  "export default function News() {",
  "export default function News() {\n  const { storeSlug } = useParams();"
);

code = code.replace(
  "to=\"/\"",
  "to={storeSlug ? `/${storeSlug}` : '/'}"
);

fs.writeFileSync('src/pages/News.tsx', code);
