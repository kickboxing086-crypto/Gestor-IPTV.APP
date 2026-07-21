const d = new Date();
const options = { timeZone: 'America/Sao_Paulo' };
const str = d.toLocaleString('en-US', options);
const brtDate = new Date(str);
console.log(brtDate.getDay(), brtDate.getHours());
