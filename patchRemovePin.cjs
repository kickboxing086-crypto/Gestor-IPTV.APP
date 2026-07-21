const fs = require('fs');

// AdminDashboard
let adminCode = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

adminCode = adminCode.replace(
  "const [pinModalConfig, setPinModalConfig] = useState<{isOpen: boolean, action: () => void, title: string}>({isOpen: false, action: () => {}, title: ''});\n",
  ""
);

adminCode = adminCode.replace(
  "import PinModal from \"../components/PinModal\";\n",
  ""
);

adminCode = adminCode.replace(
  "import { checkPin, getStoreSettings } from '../lib/store';",
  "import { getStoreSettings } from '../lib/store';"
);

adminCode = adminCode.replace(
  /const handleSaveEdit = \(id: string\) => \{\s+setPinModalConfig\(\{\s+isOpen: true,\s+title: 'Salvar Alterações\?',\s+action: \(\) => _oldHandleSaveEdit\(id\)\s+\}\);\s+\};\s+const _oldHandleSaveEdit = \(id: string\) => \{/,
  "const handleSaveEdit = (id: string) => {"
);

adminCode = adminCode.replace(
  /const handleDeleteClient = \(id: string\) => \{\s+setPinModalConfig\(\{\s+isOpen: true,\s+title: 'Excluir Cliente\?',\s+action: \(\) => \{\s+deleteSubscription\(id\);\s+setSubscriptions\(getSubscriptions\(\)\);\s+\}\s+\}\);\s+\};\s+const _oldHandleDeleteClient = \(id: string\) => \{/,
  "const handleDeleteClient = (id: string) => {\n    deleteSubscription(id);\n    setSubscriptions(getSubscriptions());\n  };\n  const _oldHandleDeleteClient = (id: string) => {"
);

adminCode = adminCode.replace(
  /<PinModal isOpen=\{pinModalConfig\.isOpen\} onClose=\{\(\) => setPinModalConfig\(\{...pinModalConfig, isOpen: false\}\)\} onSuccess=\{pinModalConfig\.action\} title=\{pinModalConfig\.title\} \/>\n/,
  ""
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', adminCode);

// SettingsTab
let settingsCode = fs.readFileSync('src/components/SettingsTab.tsx', 'utf8');
settingsCode = settingsCode.replace(
  "import { getStoreSettings, updateStoreSettings, setPin } from '../lib/store';",
  "import { getStoreSettings, updateStoreSettings } from '../lib/store';"
);
settingsCode = settingsCode.replace(
  "import { Save, Plus, Trash2, KeyRound, Copy } from 'lucide-react';",
  "import { Save, Plus, Trash2, Copy } from 'lucide-react';"
);
settingsCode = settingsCode.replace(
  /const handleSavePin = \(\) => \{[\s\S]*?\}\s*else\s*\{[\s\S]*?\}\s*\};\n/,
  ""
);
settingsCode = settingsCode.replace(
  /const \[pinInput, setPinInput\] = useState\(''\);\n/,
  ""
);
settingsCode = settingsCode.replace(
  /<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 border-l-4 border-l-purple-500">[\s\S]*?<\/div>\s*<\/div>/,
  "</div>"
);
fs.writeFileSync('src/components/SettingsTab.tsx', settingsCode);

// store.ts
let storeCode = fs.readFileSync('src/lib/store.ts', 'utf8');
storeCode = storeCode.replace(
  /\/\/ 2FA Pin Check[\s\S]*?updateStoreSettings\(settings\);\n}/,
  ""
);
fs.writeFileSync('src/lib/store.ts', storeCode);
