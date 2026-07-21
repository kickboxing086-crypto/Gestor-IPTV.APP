const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "import { checkPin } from '../lib/store';",
  "import { checkPin, getStoreSettings } from '../lib/store';\nimport { StoreSettings } from '../types';"
);

code = code.replace(
  "const [activeTab, setActiveTab]",
  "const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);\n  useEffect(() => {\n    setStoreSettings(getStoreSettings());\n  }, []);\n  const [activeTab, setActiveTab]"
);

code = code.replace(
  "className=\"flex-1 w-full max-w-7xl mx-auto px-4 py-8\"",
  "className={`flex-1 w-full min-h-screen ${storeSettings?.backgroundColor || 'bg-slate-950'} pb-8`}"
);

code = code.replace(
  "<div className=\"flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-800\">",
  "<div className=\"w-full max-w-7xl mx-auto px-4 py-8\">\n      <div className=\"flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-800\">"
);

code = code.replace(
  "      <PinModal",
  "      </div>\n      <PinModal"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
