import React, { useEffect, useMemo, useState } from 'react';
import { House, Plus, Search, Trophy, Users, MapPin, Instagram, X, Hammer, ChevronRight, Sparkles, Cloud, HardDrive } from 'lucide-react';
import { hasSupabase, supabase } from './supabase.js';

const stateCenters = {
 AC:[-9.9754,-67.8249],AL:[-9.6658,-35.7353],AP:[0.0349,-51.0694],AM:[-3.119,-60.0217],BA:[-12.9714,-38.5014],CE:[-3.7172,-38.5433],DF:[-15.7939,-47.8828],ES:[-20.3155,-40.3128],GO:[-16.6869,-49.2648],MA:[-2.5307,-44.3068],MT:[-15.601,-56.0974],MS:[-20.4697,-54.6201],MG:[-19.9167,-43.9345],PA:[-1.4558,-48.4902],PB:[-7.1195,-34.845],PR:[-25.4284,-49.2733],PE:[-8.0476,-34.877],PI:[-5.0892,-42.8016],RJ:[-22.9068,-43.1729],RN:[-5.7945,-35.211],RS:[-30.0346,-51.2177],RO:[-8.7612,-63.9004],RR:[2.8235,-60.6758],SC:[-27.5954,-48.548],SP:[-23.5505,-46.6333],SE:[-10.9472,-37.0731],TO:[-10.184,-48.3336]
};
const stateNames={AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
const states=Object.keys(stateNames).sort();
const icon=L.divIcon({className:'house-pin',html:'<div class="pin-house">🏡</div>',iconSize:[42,42],iconAnchor:[21,35],popupAnchor:[0,-34]});
const cleanInstagram=v=>{const s=v.trim().replace(/^@+/,'').replace(/\s/g,'');return s?'@'+s:''};

export default function App(){
 const [people,setPeople]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(''),[modal,setModal]=useState(false),[selected,setSelected]=useState(null),[notice,setNotice]=useState(''),[form,setForm]=useState({name:'',instagram:'',city:'',state:'GO'});
 useEffect(()=>{loadPeople()},[]);
 async function loadPeople(){
  if(hasSupabase){
   const {data,error}=await supabase.from('houses').select('*').order('created_at',{ascending:false});
   if(!error){setPeople(data.map(row=>({...row,level:row.level||1})));setLoading(false);return;}
   setNotice('Não foi possível carregar os dados online. Verifique a configuração do Supabase.');
  }
  try{const saved=JSON.parse(localStorage.getItem('mbec_people')||'null');setPeople(Array.isArray(saved)?saved:sample);}catch{setPeople(sample);}
  setLoading(false);
 }
 useEffect(()=>{if(!hasSupabase && !loading)localStorage.setItem('mbec_people',JSON.stringify(people));},[people,loading]);
 const shown=useMemo(()=>{const q=search.trim().toLowerCase();return q?people.filter(p=>[p.name,p.instagram,p.city,p.state,stateNames[p.state]].join(' ').toLowerCase().includes(q)):people;},[people,search]);
 const ranking=useMemo(()=>[...people].sort((a,b)=>b.points-a.points).slice(0,5),[people]);
 const statesPresent=new Set(people.map(p=>p.state)).size;
 async function submit(e){
  e.preventDefault();const name=form.name.trim(),instagram=cleanInstagram(form.instagram),city=form.city.trim();
  if(!name||!city||!instagram||!form.state)return;
  if(!/^[a-zA-Z0-9._]{1,30}$/.test(instagram.slice(1))){setNotice('Confira o @: use letras, números, ponto ou underline.');return;}
  if(people.some(p=>p.instagram.toLowerCase()===instagram.toLowerCase())){setNotice('Esse @ já possui uma casa cadastrada.');return;}
  const record={name,instagram,city,state:form.state,points:10,level:1};
  if(hasSupabase){
   const {data,error}=await supabase.from('houses').insert(record).select().single();
   if(error){setNotice(error.code==='23505'?'Esse Instagram já possui uma casa.':'Erro ao salvar. Confira a configuração do banco.');return;}
   const person={...data,level:data.level||1};setPeople(p=>[person,...p]);setSelected(person.id);
  }else{
   const person={...record,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),created_at:new Date().toISOString()};
   setPeople(p=>[person,...p]);setSelected(person.id);
  }
  setForm({name:'',instagram:'',city:'',state:'GO'});setModal(false);setNotice('Sua casa foi construída! Você ganhou 10 pontos.');setTimeout(()=>setNotice(''),4500);
 }
 async function upgrade(p){
  if(!p||p.points<50||p.level>=5)return;
  const patch={points:p.points-50,level:p.level+1};
  if(hasSupabase){const {error}=await supabase.from('houses').update(patch).eq('id',p.id);if(error){setNotice('Não foi possível atualizar a casa.');return;}}
  setPeople(prev=>prev.map(x=>x.id===p.id?{...x,...patch}:x));setNotice('Obra concluída! Casa atualizada.');setTimeout(()=>setNotice(''),3000);
 }
 return <div className="app">
  <header><a className="brand" href="#"><span className="logo"><House/></span><span><b>MEU BRASIL</b><small>EM CONSTRUÇÃO</small></span></a><div className="head-right"><span className="status"><i/> {hasSupabase?'Sincronizado online':'Modo demonstração'}</span><button className="btn" onClick={()=>setModal(true)}><Plus size={17}/> Construir minha casa</button></div></header>
  <section className="hero"><div><div className="eyebrow"><Sparkles size={14}/> UM BRASIL FEITO POR PESSOAS</div><h1>Cada pessoa constrói<br/><em>sua história.</em></h1><p>Coloque sua casa no mapa e faça parte de uma comunidade que cresce tijolo por tijolo.</p><button className="btn hero-btn" onClick={()=>setModal(true)}><House size={18}/> Quero minha casa <ChevronRight size={17}/></button></div><div className="stats"><div><Users/><b>{people.length}</b><small>participantes</small></div><div><MapPin/><b>{statesPresent}/27</b><small>estados presentes</small></div><div><Trophy/><b>{people.reduce((s,p)=>s+(p.points||0),0)}</b><small>pontos construídos</small></div></div></section>
  <main className="layout"><section className="map-card"><div className="section-head"><div><small>EXPLORE A COMUNIDADE</small><h2>O mapa do Brasil</h2></div><span className="map-total"><i/>{shown.length} casas</span></div><div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar nome, @, cidade ou estado..."/>{search&&<button onClick={()=>setSearch('')}><X size={15}/></button>}</div><div className="map-wrap"><MapContainer center={[-14.5,-52]} zoom={4} minZoom={3} maxZoom={12} scrollWheelZoom className="map"><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><ZoomControl position="bottomright"/>{shown.map(p=><Marker key={p.id} position={stateCenters[p.state]||[-14.5,-52]} icon={icon} eventHandlers={{click:()=>setSelected(p.id)}}><Popup><b>🏡 {p.name}</b><br/>{p.instagram}<br/>{p.city} – {p.state}<br/>Nível {p.level||1} · {p.points} pontos</Popup></Marker>)}</MapContainer><div className="legend">🏡 Cada marcador representa uma casa</div></div><p className="note">Localização aproximada na capital do estado. Não pedimos endereço residencial.</p></section>
  <aside className="sidebar"><section className="side-card"><div className="section-head"><div><small>QUEM ESTÁ CONSTRUINDO</small><h3>Participantes</h3></div><b className="bubble">{people.length}</b></div>{loading?<p className="muted">Carregando...</p>:shown.length===0?<p className="muted">Nenhuma casa encontrada.</p>:shown.slice(0,9).map(p=><button className={'person '+(selected===p.id?'active':'')} key={p.id} onClick={()=>setSelected(p.id)}><span>🏡</span><label><b>{p.name}</b><small>{p.instagram} · {p.city}/{p.state}</small></label><em>N{p.level||1}</em></button>)}</section><section className="side-card"><div className="section-head"><div><small>DESTAQUES</small><h3><Trophy size={17}/> Ranking de pontos</h3></div></div>{ranking.map((p,i)=><div className="rank" key={p.id}><b>{i+1}</b><span>{p.name}<small>{p.city}/{p.state}</small></span><strong>{p.points} pts</strong></div>)}</section>{selected&&people.find(p=>p.id===selected)&&(()=>{const p=people.find(x=>x.id===selected);return <section className="side-card selected"><div className="selected-top"><span>🏡</span><button onClick={()=>setSelected(null)}><X size={15}/></button></div><h3>{p.name}</h3><p>{p.instagram} · {p.city}/{p.state}</p><div className="level-line"><span>Nível {p.level||1}</span><b>{p.points} pontos</b></div><div className="progress"><i style={{width:(p.points%100)+'%'}}/></div><button className="upgrade" disabled={p.points<50||p.level>=5} onClick={()=>upgrade(p)}><Hammer size={15}/> Melhorar casa · 50 pontos</button></section>})()}</aside></main>
  <section className="how"><small>É SIMPLES ASSIM</small><h2>Seu lugar começa aqui.</h2><div className="steps"><article><b>01</b><h3>Faça seu cadastro</h3><p>Informe nome, Instagram, cidade e estado.</p></article><article><b>02</b><h3>Receba sua casa</h3><p>Sua construção aparece no mapa do Brasil.</p></article><article><b>03</b><h3>Construa mais</h3><p>Ganhe pontos e evolua sua casa.</p></article></div></section>
  <footer><span className="brand"><span className="logo"><House/></span><span><b>MEU BRASIL</b><small>EM CONSTRUÇÃO</small></span></span><span>Feito de pessoas, construído tijolo por tijolo. 🇧🇷</span><small>{hasSupabase?<><Cloud size={13}/> Banco online</>:<><HardDrive size={13}/> Dados locais nesta demonstração</>}</small></footer>
  {notice&&<div className="toast">{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}
  {modal&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><section className="modal"><div className="modal-head"><div><small>SEU TERRENO ESTÁ ESPERANDO</small><h2>Construa sua casa</h2><p>Preencha os dados para participar.</p></div><button onClick={()=>setModal(false)}><X/></button></div><form onSubmit={submit}><label>Seu nome<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} maxLength="60" placeholder="Como podemos chamar você?" required/></label><label><span><Instagram size={14}/> Instagram</span><input value={form.instagram} onChange={e=>setForm({...form,instagram:e.target.value})} maxLength="31" placeholder="@seuinstagram" required/></label><label>Sua cidade<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} maxLength="60" placeholder="Ex.: Goiânia" required/></label><label>Estado<select value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>{states.map(s=><option key={s} value={s}>{s} — {stateNames[s]}</option>)}</select></label><p className="privacy"><MapPin size={15}/> A casa aparece em localização aproximada, sem mostrar endereço residencial.</p><button className="btn submit" type="submit"><House size={17}/> Criar minha casa · ganhar 10 pontos</button><small className="disclaimer">Seu nome, @, cidade e estado ficarão visíveis publicamente.</small></form></section></div>}
 </div>;
}
