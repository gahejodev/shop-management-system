'use strict';
const KEY='shopdesk-v1';
const initial={products:[],sales:[]};
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&Array.isArray(d.products)&&Array.isArray(d.sales)?d:structuredClone(initial)}catch{return structuredClone(initial)}}
let data=load();
const $=id=>document.getElementById(id);
const money=n=>'Rs '+Number(n).toLocaleString('en-PK',{maximumFractionDigits:2});
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const td=(text)=>{const el=document.createElement('td');el.textContent=String(text);return el};
function render(){
 $('productsCount').textContent=data.products.length;
 $('stockValue').textContent=money(data.products.reduce((s,p)=>s+p.cost*p.stock,0));
 $('revenue').textContent=money(data.sales.reduce((s,x)=>s+x.revenue,0));
 $('profit').textContent=money(data.sales.reduce((s,x)=>s+x.profit,0));
 const term=$('search').value.trim().toLowerCase();$('inventory').replaceChildren();
 for(const p of data.products.filter(x=>x.name.toLowerCase().includes(term))){const tr=document.createElement('tr');[p.name,money(p.cost),money(p.price),p.stock].forEach(x=>tr.append(td(x)));const action=td('');const btn=document.createElement('button');btn.textContent='Delete';btn.className='danger';btn.onclick=()=>{if(confirm(`Delete ${p.name}? Previous sales remain in history.`)){data.products=data.products.filter(x=>x.id!==p.id);save();render()}};action.append(btn);tr.append(action);$('inventory').append(tr)}
 $('saleProduct').replaceChildren();for(const p of data.products){const opt=document.createElement('option');opt.value=p.id;opt.textContent=`${p.name} (${p.stock} in stock)`;$('saleProduct').append(opt)}
 $('sales').replaceChildren();for(const s of [...data.sales].reverse().slice(0,25)){const tr=document.createElement('tr');[new Date(s.date).toLocaleString(),s.name,s.quantity,money(s.revenue),money(s.profit)].forEach(x=>tr.append(td(x)));$('sales').append(tr)}
}
$('productForm').addEventListener('submit',e=>{e.preventDefault();const name=$('name').value.trim();const cost=Number($('cost').value),price=Number($('price').value),stock=Number($('stock').value);if(!name||![cost,price,stock].every(Number.isFinite)||cost<0||price<0||!Number.isInteger(stock)||stock<0)return alert('Enter valid product details.');data.products.push({id:crypto.randomUUID(),name,cost,price,stock});save();e.target.reset();render()});
$('saleForm').addEventListener('submit',e=>{e.preventDefault();const p=data.products.find(x=>x.id===$('saleProduct').value),quantity=Number($('quantity').value);if(!p||!Number.isInteger(quantity)||quantity<1||quantity>p.stock){$('message').textContent='Invalid quantity or insufficient stock.';return}p.stock-=quantity;data.sales.push({id:crypto.randomUUID(),date:new Date().toISOString(),name:p.name,quantity,revenue:quantity*p.price,profit:quantity*(p.price-p.cost)});save();render();$('message').textContent='Sale recorded successfully.'});
$('search').addEventListener('input',render);
$('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`shopdesk-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();