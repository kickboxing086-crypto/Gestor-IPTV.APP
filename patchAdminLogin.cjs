const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

code = code.replace(
  "import { Lock, UserPlus } from 'lucide-react';",
  "import { Lock, UserPlus } from 'lucide-react';\nimport { updateStoreSettings, getStoreSettings } from '../lib/store';"
);

code = code.replace(
  "localStorage.setItem('tenant_storeName', storeName);\n      navigate('/admin/dashboard');",
  "localStorage.setItem('tenant_storeName', storeName);\n      const settings = getStoreSettings(email);\n      updateStoreSettings(settings);\n      navigate('/admin/dashboard');"
);

code = code.replace(
  "localStorage.setItem('tenant_storeName', 'Elite Streaming');\n         navigate('/admin/dashboard');",
  "localStorage.setItem('tenant_storeName', 'Elite Streaming');\n         const settings = getStoreSettings(email);\n         updateStoreSettings(settings);\n         navigate('/admin/dashboard');"
);

code = code.replace(
  "localStorage.setItem('tenant_storeName', user.storeName || 'Minha Loja');\n        navigate('/admin/dashboard');",
  "localStorage.setItem('tenant_storeName', user.storeName || 'Minha Loja');\n        const settings = getStoreSettings(user.email);\n        updateStoreSettings(settings);\n        navigate('/admin/dashboard');"
);

fs.writeFileSync('src/pages/AdminLogin.tsx', code);
