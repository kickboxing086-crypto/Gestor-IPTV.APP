const fs = require('fs');
let code = fs.readFileSync('src/pages/Success.tsx', 'utf8');

code = code.replace(
  "import { Subscription, PLANS } from '../types';",
  "import { Subscription } from '../types';\nimport { getStoreSettingsBySlug } from '../lib/store';"
);

code = code.replace(
  "export default function Success() {\n  const { storeSlug } = useParams();",
  "export default function Success() {\n  const { storeSlug, subscriptionId } = useParams();\n  const [plans, setPlans] = React.useState<any[]>([]);\n  React.useEffect(() => {\n    const settings = getStoreSettingsBySlug(storeSlug);\n    if (settings) {\n      setPlans(settings.plans);\n    }\n  }, [storeSlug]);\n"
);

// We need to make sure we import React
if (!code.includes("import React")) {
  code = "import React from 'react';\n" + code;
}

code = code.replace(
  "const plan = PLANS.find(p => p.id === subscription.planId);",
  "const plan = plans.find(p => p.id === subscription.planId);"
);

fs.writeFileSync('src/pages/Success.tsx', code);
