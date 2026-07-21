const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Add pin modal state
code = code.replace(
  "const [activeTab",
  "const [pinModalConfig, setPinModalConfig] = useState<{isOpen: boolean, action: () => void, title: string}>({isOpen: false, action: () => {}, title: ''});\n  const [activeTab"
);

// Modify handleDeleteClient
code = code.replace(
  "const handleDeleteClient = (id: string) => {",
  "const handleDeleteClient = (id: string) => {\n    setPinModalConfig({\n      isOpen: true,\n      title: 'Excluir Cliente?',\n      action: () => {\n        deleteSubscription(id);\n        setSubscriptions(getSubscriptions());\n      }\n    });\n  };\n  const _oldHandleDeleteClient = (id: string) => {"
);

// Update render tab logic
code = code.replace(
  "<button\n              onClick={() => setActiveTab('news')}",
  "<button\n              onClick={() => setActiveTab('news')}"
);
// Actually, I can use a simpler replacement for the tab buttons.
const tabsInjection = `
            <button
              onClick={() => setActiveTab('news')}
              className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${activeTab === 'news' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}\`}
            >
              Novidades
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={\`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}\`}
            >
              Configurações
            </button>
`;
code = code.replace(/<button\s+onClick=\{\(\) => setActiveTab\('news'\)\}[\s\S]*?<\/button>/, tabsInjection);

const contentInjection = `
          {activeTab === 'settings' && (
            <SettingsTab />
          )}
          {activeTab === 'clients' && (
`;
code = code.replace(/\{activeTab === 'clients' && \(/, contentInjection);

// Add PinModal before closing div
code = code.replace(
  "    </div>\n  );\n}",
  "      <PinModal isOpen={pinModalConfig.isOpen} onClose={() => setPinModalConfig({...pinModalConfig, isOpen: false})} onSuccess={pinModalConfig.action} title={pinModalConfig.title} />\n    </div>\n  );\n}"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
