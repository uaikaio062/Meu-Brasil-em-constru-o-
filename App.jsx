import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { House, Plus, Search, Trophy, Users, MapPin, Instagram, X, Hammer, ChevronRight, Sparkles, Cloud, HardDrive } from 'lucide-react';
import { hasSupabase, supabase } from './supabase.js';

mapboxgl.accessToken = 'pk.eyJ1IjoidWFpa2FpbzA2MiIsImEiOiJjbXdnanFjY2UwamlvMnpzZWFkM3FtN3p5In0.QmWtBhr2roWkS3uhs1wH1Q';

const stateCenters = {
 AC:[-67.8249,-9.9754],AL:[-35.7353,-9.6658],AP:[-51.0694,0.0349],AM:[-60.0217,-3.119],BA:[-38.5014,-12.9714],CE:[-38.5433,-3.7172],DF:[-47.8828,-15.7939],ES:[-40.3128,-20.3155],GO:[-49.2648,-16.6869],MA:[-44.3068,-2.5307],MT:[-56.0974,-15.601],MS:[-54.6201,-20.4697],MG:[-43.9345,-19.9167],PA:[-48.4902,-1.4558],PB:[-34.845,-7.1195],PR:[-49.2733,-25.4284],PE:[-34.877,-8.0476],PI:[-42.8016,-5.0892],RJ:[-43.1729,-22.9068],RN:[-35.211,-5.7945],RS:[-51.2177,-30.0346],RO:[-63.9004,-8.7612],RR:[-60.6758,2.8235],SC:[-48.548,-27.5954],SP:[-46.6333,-23.5505],SE:[-37.0731,-10.9472],TO:[-48.3336,-10.184]
};

const stateNames={AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
const states=Object.keys(stateNames).sort();
const cleanInstagram=v=>{const s=v.trim().replace(/^@+/,'').replace(/\s/g,'');return s?'@'+s:''};

export default function App(){
 const [people,setPeople]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(''),[modal,setModal]=useState(false),[selected,setSelected]=useState(null),[notice,setNotice]=useState(''),[form,setForm]=useState({name:'',instagram:'',city:'',state:'GO'});
 
 const mapContainer = useRef(null);
 const map = useRef(null);
 const markersRef = useRef([]);

 useEffect(()=>{loadPeople()},[]);

 async function loadPeople(){
  if(hasSupabase){
   const {data,error}=await supabase.from('houses').select('*').order('created_at',{ascending:false});
   if(!error){setPeople(data.map(row=>({...row,level:row.level||1})));setLoading(false);return;}
   setNotice('Não foi possível carregar os dados online. Verifique a configuração do Supabase.');
  }
  try{const saved=JSON.parse(localStorage.getItem('mbec_people')||'null');setPeople(Array.isArray(saved)?saved:[]);}catch{setPeople([]);}
  setLoading(false);
 }

 useEffect(()=>{if(!hasSupabase && !loading)localStorage.setItem('mbec_people',JSON.stringify(people));},[people,loading]);

 const shown=useMemo(()=>{const q=search.trim().toLowerCase();return q?people.filter(p=>[p.name,p.instagram,p.city,p.state,stateNames[p.state]].join(' ').toLowerCase().includes(q)):people;},[people,search]);
 const ranking=useMemo(()=>[...people].sort((a,b)=>b.points-a.points).slice(0,5),[people]);
 const statesPresent=new Set(people.map(p=>p.state)).size;

 useEffect(() => {
  if (map.current) return;
  map.current = new mapboxgl.Map({
   container: mapContainer.current,
   style: 'mapbox://styles/mapbox/streets-v12',
   center: [-52, -14.5],
   zoom: 3.5,
   minZoom: 3,
   maxZoom: 12
  });
  map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
 }, []);

 useEffect(() => {
  if (!map.current) return;
  
  markersRef.current.forEach(marker => marker.remove());
  markersRef.current = [];

  shown.forEach(p => {
   const el = document.createElement('div');
   el.className = 'house-pin';
   el.innerHTML = '<div class="pin-house" style="font-size: 24px; cursor: pointer;">🏡</div>';

   const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    `<b>🏡 ${p.name}</b><br/>${p.instagram}<br/>${p.city} – ${p.state}<br/>Nível ${p.level||1} · ${p.points} pontos`
   );

   const coords = stateCenters[p.state] || [-52, -14.5];
   const marker = new mapboxgl.Marker(el)
    .setLngLat(coords)
    .setPopup(popup)
    .addTo(map.current);

   el.addEventListener('click', () => setSelected(p.id));
   markersRef.current.push(marker);
  });
 }, [shown]);

 async function submit(e){
  e.preventDefault();const name=form.name.trim(),instagram=cleanInstagram(form.instagram),city=form.city.trim();
  if(!name||!city||!instagram||!form.state)return
