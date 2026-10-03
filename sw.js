/* =========================================================
   DL LUXURY
   SERVICE WORKER - PWA
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const CACHE_NAME = "dl-luxury-v2";


/* =========================================================
   ARCHIVOS PRINCIPALES
   ========================================================= */

const ARCHIVOS_CACHE = [

    "./",

    /* =========================
       PÁGINAS
    ========================= */

    "./index.html",
    "./tienda.html",
    "./perfil.html",
    "./favorito.html",
    "./carrito.html",

    /* =========================
       MANIFEST
    ========================= */

    "./manifest.json",

    /* =========================
       CSS
    ========================= */

    "./style.css",

    /* =========================
       JAVASCRIPT
    ========================= */

    "./script.js",

    /* =========================
       LOGO
    ========================= */

    "./imglogo.png"
];


/* =========================================================
   INSTALACIÓN
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "DL Luxury PWA: instalando Service Worker..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return Promise.all(

                    ARCHIVOS_CACHE.map(archivo => {

                        return cache.add(archivo)
                            .catch(error => {

                                console.warn(
                                    "DL Luxury PWA: no se pudo guardar:",
                                    archivo,
                                    error
                                );

                            });

                    })

                );

            })

    );


    /*
       Activa inmediatamente
       la nueva versión.
    */

    self.skipWaiting();

});


/* =========================================================
   ACTIVACIÓN
   ========================================================= */

self.addEventListener("activate", event => {

    console.log(
        "DL Luxury PWA: Service Worker activado."
    );

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        if (
                            cacheName !== CACHE_NAME &&
                            cacheName.startsWith("dl-luxury-")
                        ) {

                            console.log(
                                "DL Luxury PWA: eliminando caché antigua:",
                                cacheName
                            );

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

    );


    /*
       Toma control inmediatamente.
    */

    self.clients.claim();

});


/* =========================================================
   PETICIONES
   ========================================================= */

self.addEventListener("fetch", event => {

    /*
       Solo manejamos GET.
    */

    if (event.request.method !== "GET") {

        return;

    }


    const url =
        new URL(event.request.url);


    /*
       Solo manejamos archivos
       del mismo dominio.
    */

    if (
        url.origin !==
        self.location.origin
    ) {

        return;

    }


    /* =====================================================
       CACHE FIRST
    ===================================================== */

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                /*
                   Si existe en caché,
                   lo utilizamos.
                */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /*
                   Si no existe,
                   buscamos en Internet.
                */

                return fetch(event.request)

                    .then(networkResponse => {

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type === "opaque"
                        ) {

                            return networkResponse;

                        }


                        /*
                           Guardamos una copia.
                        */

                        const responseClone =
                            networkResponse.clone();


                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });


                        return networkResponse;

                    });

            })

            .catch(() => {

                /*
                   Si no hay Internet,
                   mostramos el inicio.
                */

                return caches.match(
                    "./index.html"
                );

            })

    );

});


/* =========================================================
   MENSAJES
   ========================================================= */

self.addEventListener("message", event => {

    if (
        event.data ===
        "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});


/* =========================================================
   FIN DEL SERVICE WORKER
   ========================================================= */