const fs = require('fs');
let code = fs.readFileSync('src/pages/Status.tsx', 'utf8');

code = code.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link, useParams } from 'react-router-dom';"
);

code = code.replace(
  "export default function Status() {",
  "export default function Status() {\n  const { storeSlug } = useParams();"
);

code = code.replace(
  "to=\"/\"",
  "to={storeSlug ? `/${storeSlug}` : '/'}"
);

fs.writeFileSync('src/pages/Status.tsx', code);
