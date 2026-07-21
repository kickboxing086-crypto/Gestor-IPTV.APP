const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Replace table with card layout for mobile
code = code.replace(
  /<div className="overflow-x-auto">\s*<table className="w-full text-left text-sm whitespace-nowrap">[\s\S]*?<\/table>\s*<\/div>/,
  `
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Data</th>
                  <th className="px-6 py-4">Cliente / Contato</th>
                  <th className="px-6 py-4">Plano / Status</th>
                  <th className="px-6 py-4">Código App</th>
                  <th className="px-6 py-4 rounded-tr-xl text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma assinatura encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const plan = (storeSettings?.plans || DEFAULT_PLANS).find(p => p.id === sub.planId);
                    
                    return (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{sub.firstName} {sub.lastName}</div>
                          <div className="text-slate-400 text-xs mt-1">{sub.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{plan?.name || 'Desconhecido'}</div>
                          <div className={\`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 \${
                            sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                            sub.status === 'trial' ? 'bg-blue-500/10 text-blue-400' :
                            sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }\`}>
                            {sub.status === 'active' ? 'Ativo' :
                             sub.status === 'trial' ? 'Teste' :
                             sub.status === 'cancelled' ? 'Cancelado' :
                             'Pendente'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-slate-950 px-2 py-1 rounded text-slate-300">
                            {sub.protocolCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEditClient(sub)}
                            className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClient(sub.id)}
                            className="text-red-400 hover:text-red-300 transition-colors font-medium text-sm"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center text-slate-500 py-8">Nenhuma assinatura encontrada.</div>
            ) : (
              filteredSubscriptions.map((sub) => {
                const plan = (storeSettings?.plans || DEFAULT_PLANS).find(p => p.id === sub.planId);
                return (
                  <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white">{sub.firstName} {sub.lastName}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{sub.phone}</div>
                      </div>
                      <div className={\`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium \${
                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        sub.status === 'trial' ? 'bg-blue-500/10 text-blue-400' :
                        sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }\`}>
                        {sub.status === 'active' ? 'Ativo' :
                         sub.status === 'trial' ? 'Teste' :
                         sub.status === 'cancelled' ? 'Cancelado' :
                         'Pendente'}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Plano:</span>
                      <span className="text-white font-medium">{plan?.name || 'Desconhecido'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Código App:</span>
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-300">{sub.protocolCode}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800">
                      <span className="text-slate-500 text-xs">{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</span>
                      <div className="space-x-3">
                        <button onClick={() => handleEditClient(sub)} className="text-blue-400 hover:text-blue-300 font-medium text-sm">Editar</button>
                        <button onClick={() => handleDeleteClient(sub.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Excluir</button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
  `
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
