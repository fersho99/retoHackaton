// Service worker: deja la app abierta sin conexión.
// - Archivos estáticos, imágenes y datos: caché primero.
// - Páginas: red primero, y si no hay red, la última copia guardada.
// - La tarjeta para compartir (/api) siempre va a la red.
const VERSION = "v1";
const ESTATICO = `estatico-${VERSION}`;
const PAGINAS = `paginas-${VERSION}`;
const PRECARGA = ["/", "/data/cube.json", "/data/municipal.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(PAGINAS)
      .then((c) => c.addAll(PRECARGA))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(
          ks
            .filter((k) => k !== ESTATICO && k !== PAGINAS)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copia = res.clone();
          caches.open(PAGINAS).then((c) => c.put("/", copia));
          return res;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  e.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(ESTATICO).then((c) => c.put(request, copia));
          }
          return res;
        }),
    ),
  );
});
