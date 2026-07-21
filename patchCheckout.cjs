const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

code = code.replace(
  "import { DeviceType, PLANS } from '../types';",
  "import { DeviceType } from '../types';\nimport { getStoreSettingsBySlug } from '../lib/store';"
);

code = code.replace(
  "export default function Checkout() {",
  "export default function Checkout() {\n  const { storeSlug } = useParams();\n  const [plans, setPlans] = React.useState<any[]>([]);\n  React.useEffect(() => {\n    const settings = getStoreSettingsBySlug(storeSlug);\n    if (settings) {\n      setPlans(settings.plans);\n    }\n  }, [storeSlug]);\n"
);

code = code.replace(
  "const plan = PLANS.find(p => p.id === planId);",
  "const plan = plans.find(p => p.id === planId);"
);

code = code.replace(
  "if (!plan) return <Navigate to=\"/\" replace />;",
  "if (plans.length > 0 && !plan) return <Navigate to={storeSlug ? `/${storeSlug}` : '/'} replace />;\n  if (plans.length === 0) return null; // loading state\n"
);

code = code.replace(
  "navigate(`/success/${subscription.id}`);",
  "navigate(`/${storeSlug}/success/${subscription.id}`);"
);

code = code.replace(
  "to=\"/\"",
  "to={storeSlug ? `/${storeSlug}` : '/'}"
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
