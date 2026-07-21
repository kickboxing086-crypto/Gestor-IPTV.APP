const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';",
  "import { BrowserRouter as Router, Routes, Route, Outlet, Link, Navigate, useParams } from 'react-router-dom';\nimport { useEffect, useState } from 'react';\nimport { getStoreSettings } from './lib/store';"
);

// We need Layout to read storeSlug and apply background color
const newLayout = `
function Layout() {
  const { storeSlug } = useParams();
  const [bgColor, setBgColor] = useState('bg-slate-950');

  useEffect(() => {
    // Find store by slug
    // We can just iterate through all localstorage to find if we need, 
    // or since this is client side mocked, we can assume the tenant_email is saved in localstorage 
    // But how to get the right store settings based on slug?
    // Let's create a helper in store.ts: getStoreSettingsBySlug(slug)
    const settings = getStoreSettingsBySlug(storeSlug);
    if (settings && settings.backgroundColor) {
      setBgColor(settings.backgroundColor);
    } else {
      setBgColor('bg-slate-950');
    }
  }, [storeSlug]);

  return (
    <div className={\`min-h-screen \${bgColor} text-slate-50 font-sans flex flex-col\`}>
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
        <p>&copy; {new Date().getFullYear()} Gestor IPTV. Todos os direitos reservados.</p>
        <Link to="/admin/login" className="text-slate-800 hover:text-slate-600 transition-colors text-xs">Acesso Restrito</Link>
      </footer>
    </div>
  );
}
`;

code = code.replace(/function Layout\(\) \{[\s\S]*?\}\n/, newLayout);

const newRoutes = `
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/:storeSlug" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="checkout/:planId" element={<Checkout />} />
          <Route path="success/:subscriptionId" element={<Success />} />
          <Route path="status" element={<Status />} />
          <Route path="novidades" element={<News />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
`;
code = code.replace(/<Routes>[\s\S]*?<\/Routes>/, newRoutes);

fs.writeFileSync('src/App.tsx', code);
