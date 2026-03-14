const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

c = c.replace(/bg-slate-950/g, 'bg-slate-50');
c = c.replace(/bg-slate-900/g, 'bg-white');
c = c.replace(/bg-slate-800\/40/g, 'bg-slate-100');
c = c.replace(/bg-slate-800\/60/g, 'bg-slate-200');
c = c.replace(/bg-slate-800 border-slate-600 border/g, 'bg-blue-600 text-white shadow-md shadow-blue-200');
c = c.replace(/bg-slate-800 text-slate-200 border border-slate-700/g, 'bg-blue-600 text-white shadow-md shadow-blue-200');
c = c.replace(/bg-slate-800/g, 'bg-slate-100');
c = c.replace(/bg-slate-700 text-slate-200/g, 'bg-slate-100');
c = c.replace(/bg-slate-700/g, 'bg-slate-200');

c = c.replace(/border-slate-800\/50/g, 'border-slate-100');
c = c.replace(/border-slate-800/g, 'border-slate-200');
c = c.replace(/border-slate-700/g, 'border-slate-200');
c = c.replace(/border-slate-600/g, 'border-slate-300');

c = c.replace(/text-slate-100/g, 'text-slate-900');
c = c.replace(/text-slate-200/g, 'text-slate-800');
c = c.replace(/text-slate-300/g, 'text-slate-700');
c = c.replace(/text-slate-400/g, 'text-slate-600');
c = c.replace(/text-slate-500/g, 'text-slate-500');

c = c.replace(/bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/g, 'bg-gradient-to-br from-[#1e3a8a] to-[#172554] shadow-xl shadow-blue-900/20');
c = c.replace(/text-indigo-600/g, 'text-[#475569]');
c = c.replace(/text-indigo-400/g, 'text-[#3b82f6]');
c = c.replace(/bg-indigo-600/g, 'bg-[#2563eb]'); 
c = c.replace(/bg-indigo-700/g, 'bg-[#1d4ed8]');
c = c.replace(/border-indigo-500\/30/g, 'border-slate-200');
c = c.replace(/border-indigo-500\/40/g, 'border-slate-300');
c = c.replace(/shadow-black\/80/g, 'shadow-slate-200/50');
c = c.replace(/shadow-black\/60/g, 'shadow-slate-200/50');
c = c.replace(/shadow-black\/50/g, 'shadow-slate-200/30');
c = c.replace(/shadow-black\/40/g, 'shadow-slate-200/20');
c = c.replace(/bg-emerald-900\/20/g, 'bg-emerald-50');
c = c.replace(/border-emerald-800\/30/g, 'border-emerald-100');
c = c.replace(/text-emerald-300/g, 'text-emerald-800');

fs.writeFileSync('src/app/page.tsx', c);
