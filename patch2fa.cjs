const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "const handleSaveEdit = (id: string) => {",
  "const handleSaveEdit = (id: string) => {\n    setPinModalConfig({\n      isOpen: true,\n      title: 'Salvar Alterações?',\n      action: () => _oldHandleSaveEdit(id)\n    });\n  };\n  const _oldHandleSaveEdit = (id: string) => {"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
