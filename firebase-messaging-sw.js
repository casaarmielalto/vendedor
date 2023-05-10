
const CACHE_NAME = 'static-cache-v10';
const FILES_TO_CACHE = [
  '/',
  '/cliente/clientes.html',
  '/cliente/formEdit_clientes.html',
  '/cliente/formReg_clientes.html',
  '/css/estylo.css',
  '/edicion/clientesEdit.html',
  '/edicion/editarMovil.html',
  '/edicion/editarProforma.html',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/install.svg',
  '/images/logo.png',
  '/images/sort_asc.png',
  '/images/sort_asc_disabled.png',
  '/images/sort_both.png',
  '/images/sort_desc.png',
  '/images/sort_desc_disabled.png',
  '/img/Bien.PNG',
  '/img/Cerrar.png',
  '/img/Contabilidad.png',
  '/img/Data.png',
  '/img/Deuda.png',
  '/img/Herramienta.png',
  '/img/Lupa.png',
  '/img/Mal.PNG',
  '/img/Usuario.png',
  '/img/atras.png',
  '/img/calendario.png',
  '/img/camara.png',
  '/img/documento.png',
  '/img/iconos/amburger.png',
  '/img/iconos/camera.png',
  '/img/iconos/close.png',
  '/img/iconos/edit.png',
  '/img/iconos/image 00(1).png',
  '/img/iconos/image0.png',
  '/img/iconos/lapiz.png',
  '/img/iconos/logoCam.png',
  '/img/iconos/mas.png',
  '/img/iconos/menu.png',
  '/img/iconos/pc.png',
  '/img/iconos/phone.png',
  '/img/iconos/reload.png',
  '/img/iconos/succes.png',
  '/img/ubicacion.png',
  '/index.html',
  '/js/apiBakend.js',
  '/js/confire.js',
  '/js/jquery-3.5.1.min.js',
  '/js/jspdf.min.js',
  '/js/jspdf.plugin.autotable.js',
  '/js/mainDB.js',
  '/js/numberToString.js',
  '/js/pdf.js',
  '/js/pdf.worker.js',
  '/login/cambioPasword.html',
  '/login/confg.html',
  '/vender/clientes.html',
  '/vender/proforma.html',
  '/vender/venderMovil.html',
  '/ventas/descargaVentas.html',
  '/ventas/pdfVenta.html',
  '/ventas/registroVentas.html',
  '/ventas/verVenta.html'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil( caches.open(CACHE_NAME).then((cache) => { return cache.addAll(FILES_TO_CACHE); })  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) { return caches.delete(key); }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {  return response || fetch(evt.request); });
    })
  );
});
