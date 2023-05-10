var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase
function startDB(){
  dataBase = indexedDB.open("vendedor", 10);
  dataBase.onupgradeneeded = function (e){
    var active = dataBase.result; 
    var object = active.createObjectStore('inventario', { keyPath : 'id'});
    object.createIndex('by_marca', 'marca', { unique : false });
    object.createIndex('by_produ', 'produ', { unique : false });
    var object = active.createObjectStore('ventas', { keyPath : 'id'});
    var object = active.createObjectStore('clientes', { keyPath : 'id'});
  };
  dataBase.onsuccess = function (e){ init_m() };
  dataBase.onerror = function (e){console.log(e)};
}
/******* promeas generales BD ******/
function write_DB(f,col){
  return new Promise(function(resolve,reject){  
    var active = dataBase.result;
    var data = active.transaction([col], "readwrite");
    var object = data.objectStore(col);
    var request = object.put(f);
    request.onerror = function (e) {alert("Ya existe el registro");};
    data.oncomplete = function (e){ resolve(true) };
  }) 
}
function update_DB(id,f,col){
  return new Promise(function(resolve,reject){
    var active = dataBase.result;
    var data = active.transaction([col], "readwrite");
    var object = data.objectStore(col);
    var elemento = object.get(id);
    elemento.onsuccess = function(e){
      var result = e.target.result;
      for (const key in f){ result[key] = f[key]; }
      object.put(result); 
    };
    elemento.onerror = function (e) {console.log(e)};
    data.oncomplete = function (e){ resolve(true) };
  });
}
function read_DB(col){
  return new Promise(function(resolve,reject){
    var elts = [];
    var active = dataBase.result;
    var data = active.transaction([col], "readonly");
    var object = data.objectStore(col);
    var cursor = object.openCursor();
    cursor.onsuccess = function (e) {
      var result = e.target.result;
      if (result === null) {return;}
      elts.push(result.value);
      result.continue();
    };
    data.oncomplete = function() { resolve(elts) };
  });
}
function read_ID_DB(id,col){
  return new Promise(function(resolve,reject){
    var active = dataBase.result;
    var data = active.transaction([col], "readonly");
    var object = data.objectStore(col);
    var request = object.get(id);
    request.onsuccess = function (){
      var result = request.result;
      if (result !== undefined){ resolve(result) }else{ resolve(false) }
    };
  });
}
function del_DB(id,col){
  return new Promise(function(resolve,reject){
    var active = dataBase.result;
    var data = active.transaction([col], "readwrite");
    var object = data.objectStore(col);
    var request = object.delete(id);
    request.onsuccess = function (){ resolve(true) };
  })
}
function clear_coleccion(col){
  return new Promise(function(resolve,reject){
    var active = dataBase.result;
    var data = active.transaction([col], "readwrite");
    var object = data.objectStore(col);
    var objectStoreRequest = object.clear();
    objectStoreRequest.onsuccess = function(event) { resolve(true) };
  })
}
/******* promeas generales BD ******/
//////////////////////// MANEJO DE FORMULARIO //////////////////////////
function storage(key){ return (localStorage.getItem(key)==null?"":localStorage.getItem(key))}
function storageNum(key){ return (storage(key)==""?0:parseFloat(localStorage.getItem(key)))}
function storageJson(key){ return storage(key)==""?{}: JSON.parse(localStorage.getItem(key))}
function storageJsonPre(key,js){ return storage(key)==""?js: JSON.parse(localStorage.getItem(key))}
function storageDef(key,def){ 
  if(typeof(def)=="number"){
    return storage(key)==""?def:parseFloat(storage(key)) 
  }else{
    return storage(key)==""?def:storage(key)
  }
}
function storageBolean(key){ return storage(key)==""?false:true }
function ValNum(id){
  let nod = document.getElementById(id)
  if(nod.tagName=="INPUT"){
    let val = nod.value
    return (val==""?0:parseFloat(val))
  }else{
    let val = nod.textContent
    return (val==""?0:parseFloat(val))
  }
}
function dc2(n){ return parseFloat((n).toFixed(2)) }
function formClear(id){///ampliar solucion
  return new Promise(function(resolve,reject){
    const f = document.querySelectorAll('[data-'+id+']')
    for (let i = 0; i < f.length; i++) {
      const e = f[i]
      let id = e.id
      document.getElementById(id).value="";
    }
    resolve(true)
  })
}
function json_to_from(idf,stg){
  return new Promise(function(resolve,reject){
    let js
    if(stg==undefined){js = storageJson(idf)}else{js=stg}
    const f = document.querySelectorAll('[data-'+idf+']')
    for (let i = 0; i < f.length; i++) {
      if(f[i].tagName=="INPUT"){ if(js[f[i].id]){ document.getElementById(f[i].id).value = js[f[i].id] } }
      if(f[i].type=="date"){
        if(js[f[i].id]){ 
          document.getElementById(f[i].id).value = js[f[i].id] 
          document.getElementById(f[i].id+"_Txt").textContent = fechaForma2(js[f[i].id])
        }else{
          document.getElementById(f[i].id+"_Txt").textContent = fechaActualTxt()
          document.getElementById(f[i].id).value = fecActInp
        }
      }
      if(f[i].tagName=="SELECT"){ if(js[f[i].id]){ document.getElementById(f[i].id).value = js[f[i].id] } }
      if(f[i].tagName=="IMG"){ if(js[f[i].id]){ document.getElementById(f[i].id).src = js[f[i].id] }  }
      if(f[i].tagName=="LABEL"){ if(js[f[i].id]){ document.getElementById(f[i].id).textContent = js[f[i].id] } }
      if(f[i].type=="checkbox"){ if(js[f[i].id]){ document.getElementById(f[i].id).checked = js[f[i].id] } }
      /*secion info*/
      let set =  f[i].dataset[Object.keys(f[i].dataset)[0]]  
      if(f[i].tagName=="DIV" || f[i].tagName=="SPAN"){
        document.getElementById(f[i].id).textContent = js[f[i].id];
        if(set=="fechaForma2"){ if(js[f[i].id]){ document.getElementById(f[i].id).textContent = fechaForma2(js[(f[i]).id]) } }
        if(set=="checkbox"){
          if(js[f[i].id]){
            document.getElementById(f[i].id).textContent=f[i].dataset.check.split("_")[0] 
          }else{
            document.getElementById(f[i].id).textContent=f[i].dataset.check.split("_")[1]
          }
        }
      }
      /*secion info*/
    }
    resolve(true)
  })
}
function form_to_json(id){
  return new Promise(function(resolve,reject){
    const f = document.querySelectorAll('[data-'+id+']')
    let form = {}
    for (let i = 0; i < f.length; i++) {
      let id = f[i].id
      let val = f[i].value
      let tipo = f[i].type
      let tag = f[i].tagName
      if(tipo=="number"){if(val==""){form[id]=0}else{form[id]=parseFloat(val)}}
      if(tipo=="text"){form[id] = val}
      if(tipo=="date"){form[id] = val}
      if(tipo=="checkbox"){form[id] = f[i].checked}
      if(tipo=="select-one"){form[id] = val}
      if(tipo=="email"){form[id] = val}
      if(tag=="IMG"){form[id] = f[i].src}
      if(tag=="LABEL"){form[id] = f[i].textContent}
    }
    resolve(form)
  })
}
function formClearInput(id){
  return new Promise(function(resolve,reject){
    const f = document.querySelectorAll('[data-'+id+']')
    for (let i = 0; i < f.length; i++) { document.getElementById(f[i].id).value=""; }
    resolve(true)
  })
}
//////////////////////// MANEJO DE FORMULARIO //////////////////////////
function lnk(e){ var a = document.createElement("a"); a.href = e+".html"; a.click()}

///////////////////// FECHAS /////////////////////// 
const nombreMeses =  'Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre'.split(' ')
const nombreMesesCorto =  'Ene. Feb. Mar. Abr. May. Jun. Jul. Ago. Sep. Oct. Nov. Dic.'.split(' ')
let fecActSist = new Date()
function timeToMesDia(tim){//1655244456367
  let d = new Date(tim)
  let dia = d.getDate()<10?("0"+d.getDate()):d.getDate()
  let mes = d.getMonth()
  return (dia+" "+nombreMeses[mes])
}
function timeToDiaMes(tim){//1655244456367
  let d = new Date(tim)
  let dia = d.getDate()<10?("0"+d.getDate()):d.getDate()
  let mes = d.getMonth()
  return (dia+" "+nombreMesesCorto[mes])
}
function fechaForma2(f){// 10/Ene/2020
  let fc = f.split("-")
  return (fc[2]+"/"+nombreMesesCorto[fc[1]-1] +"/"+fc[0])
}
let fecActInp = fechaActual()
function fechaActual(){
  var mes = fecActSist.getMonth()+1; //mes
  var dia = fecActSist.getDate(); //dia
  var ano = fecActSist.getFullYear(); //año
  if(dia<10){dia='0'+dia}
  if(mes<10){mes='0'+mes}
  return (ano+"-"+mes+"-"+dia);
}
function fechaActualTxt(){
  var mes = fecActSist.getMonth()+1;
  var dia = fecActSist.getDate(); 
  var ano = fecActSist.getFullYear();
  if(dia<10){dia='0'+dia;}
  if(mes<10){mes='0'+mes}
  return fechaForma2(ano+"-"+mes+"-"+dia);
}
///////////////////// FECHAS /////////////////////// 
/*pantalla spiner succses contador*/
const divLoad = document.createElement("div");
divLoad.innerHTML = `
<div id="pantallaSpiner">
<div class="modalSpiner">
  <div id="spinner" class="lds-spinner">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="conter">
    <div id="conter">.</div>
  </div>  
  <div id="cajaSuccess">
    <div class="circle">
      <div id="checkSucc" class=""></div>
    </div>
  </div> 
</div>
</div>` 
function loadData(){
  document.body.appendChild(divLoad);
  document.getElementById("pantallaSpiner").style.display = "inline-block"
  document.getElementById("spinner").style.display = "block"
} 
function successDat(s,c){
  document.getElementById("spinner").style.display = "none"
  document.getElementById("cajaSuccess").style.display= 'block';
  document.getElementById("checkSucc").classList.add('success');
  setTimeout(noSucsesDat,1000);
  if(c!=undefined){ localStorage.setItem(c,"") } 
  if(s){ setTimeout(window.location.reload(),1000) } 
}
function noSucsesDat(){
  document.getElementById("pantallaSpiner").style.display = "none"
  document.getElementById("cajaSuccess").classList.add('desapareser');
  setTimeout(restarSucessesDat,750); 
}
function restarSucessesDat(){
  document.getElementById("cajaSuccess").style.display= 'none';
  document.getElementById("cajaSuccess").classList.remove('desapareser');
  document.getElementById("checkSucc").classList.remove('success');
}
/*pantalla spiner succses contador*/
function filter(){
  const text = document.getElementById("buscar").value.toUpperCase()
  for (let i = 0; i < items.length; i++) {
    const txtItm = items[i].textContent.toUpperCase()
    const idItm = items[i].id.split("_")[1]+"_"+items[i].id.split("_")[2]
    if(txtItm.indexOf(text) > -1){
      document.getElementById(idItm).style.display = ""
    }else{
      document.getElementById(idItm).style.display = "none"
    }
  }
}
///////////////////////////// secion manejo de tablas //////////////////////////////
function filter(){
  const text = document.getElementById("buscar").value.toUpperCase()
  for (let i = 0; i < items.length; i++) {
    const txtItm = items[i].textContent.toUpperCase()
    const idItm = items[i].id.split("_")[1]
    if(txtItm.indexOf(text) > -1){ document.getElementById(idItm).style.display = "" }else{ document.getElementById(idItm).style.display = "none" }
  }
}
let listCol
function manejoColumnas(tab){
  listCol = storageJson(tab)
  const head = document.getElementById("headColm").querySelectorAll("th")
  let listCkeck = ``;
  for (let i = 0; i < head.length; i++) {
    const td = head[i];
    listCkeck += 
    `<div>
      <input onclick="togleColm('cr${i+1}','${tab}')" type="checkbox" id="cr${i+1}" >
      <label for="cr${i+1}">${td.textContent}</label>
    </div>` 
    if(listCol["cr"+(i+1)]==undefined){listCol["cr"+(i+1)] = true}
  }
  document.querySelector("#contedOcultador").innerHTML = listCkeck;
  for (const key in listCol) { document.getElementById(key).checked = listCol[key]; }
  establacerColumnas(listCol)
}
function togleColm(id,tab){
  listCol[id] = document.getElementById(id).checked
  localStorage.setItem(tab, JSON.stringify(listCol))
  establacerColumnas(listCol)
}
function establacerColumnas(listCol){
  let head = document.getElementById("headColm").querySelectorAll("th")
  for (let i = 0; i < head.length; i++) {
    listCol["cr"+(i+1)]
    head[i].style.display = listCol["cr"+(i+1)]?"":"none"
  }
  var body = document.getElementById("listaDitem").querySelectorAll("tr")
  for (let i = 0; i < body.length; i++) {
    const fila = body[i].querySelectorAll("td");
    for (let i = 0; i < fila.length; i++) {
      listCol["cr"+(i+1)]
      fila[i].style.display = listCol["cr"+(i+1)]?"":"none"
    }
  }
}
function listVer(){ document.getElementById("contedOcultador").classList.add("listVer") }
function oculVer(){ document.getElementById("contedOcultador").classList.remove("listVer") }

var asend = true
function sortTable(col,type,data){
  if(type=='p'){
    if(asend){
      data.sort((a, b) => {
        if(a[col] < b[col]) return 1;
        if(a[col] > b[col]) return -1;
        return 0;
      })
      asend = false
    }else{
      data.sort((a, b) => {
        if(a[col] < b[col]) return -1;
        if(a[col] > b[col]) return 1;
        return 0;
      })
      asend = true
    }  
  }else{
    if(asend){
      data.sort(((a, b) => b[col] - a[col]));
      asend = false
    }else{
      data.sort(((a, b) => a[col] - b[col]));
      asend = true
    }
  }
  return data
}
///////////////////////////// secion manejo de tablas //////////////////////////////