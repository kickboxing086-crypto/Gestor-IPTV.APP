const fs = require('fs');

// Fix Success.tsx
let successCode = fs.readFileSync('src/pages/Success.tsx', 'utf8');
successCode = successCode.replace("const { subscriptionId } = useParams<{ subscriptionId: string }>();", "");
successCode = successCode.replace("const plan = PLANS.find(p => p?.id === sub?.planId);", "const plan = plans.find(p => p?.id === sub?.planId);");
fs.writeFileSync('src/pages/Success.tsx', successCode);

// Fix Status.tsx
let statusCode = fs.readFileSync('src/pages/Status.tsx', 'utf8');
statusCode = statusCode.replace("import { Subscription, PLANS } from '../types';", "import { Subscription } from '../types';\nimport { getStoreSettingsBySlug } from '../lib/store';");
statusCode = statusCode.replace("export default function Status() {\n  const { storeSlug } = useParams();", "export default function Status() {\n  const { storeSlug } = useParams();\n  const [plans, setPlans] = React.useState<any[]>([]);\n  React.useEffect(() => {\n    const settings = getStoreSettingsBySlug(storeSlug);\n    if (settings) {\n      setPlans(settings.plans);\n    }\n  }, [storeSlug]);\n");
if (!statusCode.includes("import React")) {
  statusCode = "import React from 'react';\n" + statusCode;
}
statusCode = statusCode.replace("PLANS.find", "plans.find");
fs.writeFileSync('src/pages/Status.tsx', statusCode);

// Fix AdminDashboard.tsx
let adminCode = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
adminCode = adminCode.replace("import { Subscription, PLANS, DeviceType, NewsItem } from '../types';", "import { Subscription, DeviceType, NewsItem } from '../types';\nimport { DEFAULT_PLANS } from '../types';");
adminCode = adminCode.replace(/PLANS\.map/g, "(storeSettings?.plans || DEFAULT_PLANS).map");
adminCode = adminCode.replace(/PLANS\.find/g, "(storeSettings?.plans || DEFAULT_PLANS).find");
fs.writeFileSync('src/pages/AdminDashboard.tsx', adminCode);

// Fix Home.tsx 
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace("PLANS.filter", "plans.filter");
fs.writeFileSync('src/pages/Home.tsx', homeCode);
