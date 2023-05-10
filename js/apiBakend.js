//const url = "https://premaned-server.glitch.me"
//const serverURL = 'wss://premaned-server.glitch.me';
const url = "http://127.0.0.1"
const serverURL = 'ws://127.0.0.1';
const token = JSON.parse((localStorage.getItem("datUser")==null||localStorage.getItem("datUser")=="")?"{}":localStorage.getItem("datUser")).tkn
//////////////////// SECION USER ////////////////////
function loginUser(email,psw){
  return new Promise(function(resolve,reject){
    fetch(url+`/loginUser`,{method:'post',headers:{'Accept':'application/json,text/plain','Content-Type':'application/json','x-access-token':psw},
      body: JSON.stringify({"email":email})
    }).then(rsp=>{ if(rsp.ok){ rsp.json().then(data=>{ resolve(data) }) }  });
  })
}
//////////////////// SECION USER ////////////////////
//////////////////// SECION VENTAS////////////////////
function createdVenta(dat){
  return new Promise(function(resolve,reject){
    fetch(url+`/createdVenta`,{method:'post',headers:{'Accept':'application/json, text/plain','Content-Type':'application/json','x-access-token':token },
      body: JSON.stringify(dat)
    }).then(res=>{ if(res.ok){ res.json().then(d=>{ resolve(d) }) } });
  })
}
function deleteVenta(id){
  return new Promise(function(resolve,reject){
    fetch(url+`/deleteVenta`,{method:'post',headers:{'Accept':'application/json,text/plain','Content-Type':'application/json','x-access-token':token },
      body: JSON.stringify({"_id":id})
    }).then(res=>{ if(res.ok){ res.text().then(d=>{resolve(d) }); } });
  })
}
function readVentasUserTime(user,tim1,tim2){
  return new Promise(function(resolve,reject){
    fetch(url+'/readVentasUserTime',{ method: 'post', 
      headers: {'Accept': 'application/json, text/plain','Content-Type': 'application/json','x-access-token':token}, 
      body: JSON.stringify({"tim1":tim1,"tim2":tim2,"user":user,})
    }).then( (res)=>{ res.json().then((d)=>{ resolve(d) }); }).catch((err)=>{ console.log(err) });
  })
}
function read_ventasIDS(){
  return new Promise(function(resolve,reject){
    fetch(url+'/read_ventasIDS').then(
      function(response) { response.json().then(function(data) { resolve(data) }); }
    ).catch(function(err){ console.log('Fetch Error :-S', err) });
  })
}
function updateVenta(dat){
  return new Promise(function(resolve,reject){
    fetch(url+`/updateVenta`,{method:'post',headers:{'Accept':'application/json, text/plain','Content-Type': 'application/json','x-access-token':token },
      body: JSON.stringify(dat)
      }).then(res => { if(res.ok) { res.text().then(d=>{ resolve(d) }); } }
    );
  })
}
//////////////////// SECION VENTAS////////////////////
//////////////////// SECION INVENTARIO////////////////////
function readInventario(){
  return new Promise(function(resolve,reject){
    let timeINV = storage("timeINV")==""?0:parseInt(storage("timeINV"))
    fetch(url+'/readInventario',{method:'post',headers:{'Accept':'application/json,text/plain','Content-Type':'application/json','x-access-token':token}, 
      body: JSON.stringify({"timeINV":timeINV})
    }).then((res)=>{ res.json().then((d)=>{ resolve(d) }); }).catch((err)=>{ console.log(err) });
  })
}
function readInventarioIDS(){
  return new Promise(function(resolve,reject){
    fetch(url+'/read_inventarioIDS').then(
      function(response) { response.json().then(function(data) { resolve(data) }); }
    ).catch(function(err){ console.log('Fetch Error :-S', err) });
  })
}
//////////////////// SECION INVENTARIO////////////////////
//////////////////// SECION CLIENTES////////////////////
function readCliente(){
  return new Promise(function(resolve,reject){
    let timeCLI = storage("timeCLI")==""?0:parseInt(storage("timeCLI"))
    fetch(url+'/readCliente',{method:'post',headers:{'Accept':'application/json,text/plain','Content-Type': 'application/json','x-access-token':token}, 
      body:JSON.stringify({"timeCLI":timeCLI})
    }).then((res)=>{ res.json().then((d)=>{ resolve(d) }); }).catch((err)=>{ console.log(err) });
  })
}
function readClientesIDS(){
  return new Promise(function(resolve,reject){
    fetch(url+'/read_clientesIDS').then(
      function(response) { response.json().then(function(data) { resolve(data) }); }
    ).catch(function(err){ console.log('Fetch Error :-S', err) });
  })
}
//////////////////// SECION CLIENTES////////////////////
function timeLocal(id){ return localStorage.getItem(id)==null?0:parseInt(localStorage.getItem(id)) }
function elemtDif(d1,d2){
  var ar = [];
  for (var i = 0; i < d1.length; i++) {
    var ig = false;
    for (var j = 0; j < d2.length & !ig; j++){ if(d1[i]['id'] == d2[j]['id']){ ig=true } }
    if(!ig){ ar.push(d1[i]) }
  }
  return ar
}
/** SINCRONIZACION DE INVENTARIO **/
async function sincroINV(){
  loadData()
  let datCloud = await readInventario()
  let datos = datCloud["record"]
  for (let i = 0; i < datos.length; i++) {
    let item = datos[i];
    await write_DB(item,'inventario')
    document.getElementById("conter").textContent = datos.length-i//animacion
    if(item["time"]>timeLocal("timeINV")){ localStorage.setItem("timeINV",item["time"]) }
  }
  let datLocal = await read_DB('inventario')
  if(datCloud["count"]<datLocal.length){ 
    //sincroDelsINV()
  }else{ successDat() }
}
async function sincroDelsINV(){
  let datLocal = await read_DB('inventario')
  let arrCloud = await readInventarioIDS()
  let sincroDel = elemtDif(datLocal,arrCloud)
  for (let i = 0; i < sincroDel.length; i++) {
    let dat = sincroDel[i];
    let delLoc = await del_DB(dat.id,'inventario')
    console.log("eleiminando item..!!")
  }
  console.log("Inventario Sincronisados...!!!")
  successDat()
}
/** SINCRONIZACION DE INVENTARIO **/
/** SINCRONIZACION DE CLIENTES **/
async function sincroCLI(){
  loadData()
  let datCloud = await readCliente()
  let datos = datCloud["record"]
  for (let i = 0; i < datos.length; i++) {
    let item = datos[i];
    await write_DB(item,'clientes')
    document.getElementById("conter").textContent = datos.length-i//animacion
    if(item["time"]>timeLocal("timeCLI")){ localStorage.setItem("timeCLI",item["time"]) }
  }
  let datLocal = await read_DB('clientes')
  console.log(datCloud["count"])
  if(datCloud["count"]<datLocal.length){ 
    //sincroDelsCLI() 
  }else{ successDat() }
}
async function sincroDelsCLI(){
  let datLocal = await read_DB('clientes')
  let arrCloud = await readClientesIDS()
  let sincroDel = elemtDif(datLocal,arrCloud)
  for (let i = 0; i < sincroDel.length; i++) {
    let dat = sincroDel[i];
    let delLoc = await del_DB(dat.id,'clientes')
    console.log("eleiminando cliente..!!")
  }
  console.log("clientes Sincronisados...!!!")
  successDat()
}
/** SINCRONIZACION DE CLIENTES **/
///////// Actualizar Inventario tiempo real /////////
async function changeInventario(init){
  console.log("bajando cambios inventario....")
  document.getElementById("conection").classList.add("animacionPulso")
  let datCloud = await readInventario()
  let datos = datCloud["record"]
  for (let i = 0; i < datos.length; i++) {
    let item = datos[i];
    await write_DB(item,'inventario')
    if(item["time"]>timeLocal("timeINV")){ localStorage.setItem("timeINV",item["time"]) }
  }
  let datLocal = await read_DB('inventario')
  if(datCloud["count"]<datLocal.length){ 
    deleteChangeInventario(init)
  }else{
    console.log("cambios registrados inventario....")
    document.getElementById("conection").classList.remove("animacionPulso")
    if(init){ renderDatos(true) }
  }
}
async function deleteChangeInventario(init){
  console.log("eleiminando item..!!")
  let datLocal = await read_DB('inventario')
  let arrCloud = await readInventarioIDS()
  let sincroDel = elemtDif(datLocal,arrCloud)
  for (let i = 0; i < sincroDel.length; i++) {
    let dat = sincroDel[i];
    let delLoc = await del_DB(dat.id,'inventario')
  }
  console.log("cambios registrados inventario....")
  document.getElementById("conection").classList.remove("animacionPulso")
  if(init){ renderDatos(true) }
}
///////// Actualizar Inventario tiempo real /////////

/////////////// WEBSOCKET //////////////
let socket;
let initFunConet
function openSocket(v){
  initFunConet = v
  socket = new WebSocket(serverURL);
  socket.addEventListener('open', openConnection);
  socket.addEventListener('close', closeConnection);
  socket.addEventListener('message', readIncomingMessage);
}
function openConnection(){
  document.getElementById("conection").style.backgroundColor = "rgb(30, 255, 0)"
  if (socket.readyState===WebSocket.OPEN){ 
    if(initFunConet){ changeInventario(true)  }else{ changeInventario(false) }
  }
}
function closeConnection(){
  document.getElementById("conection").style.backgroundColor = "rgb(255, 0, 0)"
}
function readIncomingMessage(event) {
  console.log(event.data)
  if(initFunConet){ changeInventario(true)  }else{ changeInventario(false) }
}
function sendMessage(dat){
  if (socket.readyState===WebSocket.OPEN){ socket.send(dat); }
}
/////////////// WEBSOCKET //////////////