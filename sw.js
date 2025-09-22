// Service Worker - Quiz UNISA AVC 1.1a
// Versão com cache offline completo

const CACHE_NAME = 'quiz-unisa-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './data/questions.json',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalação - Cache dos recursos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Erro ao adicionar recursos ao cache:', err);
      })
  );
  // Ativa imediatamente
  self.skipWaiting();
});

// Ativação - Limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Assume controle imediato
  self.clients.claim();
});

// Fetch - Estratégia Cache First com fallback para rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone da resposta
          const responseToCache = response.clone();

          // Adiciona ao cache apenas recursos do mesmo domínio
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        // Página offline customizada se necessário
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Mensagem para atualizar o app
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Background Sync para envio de dados quando voltar online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-results') {
    event.waitUntil(syncResults());
  }
});

async function syncResults() {
  // Implementação futura para sincronizar resultados com servidor
  console.log('Sincronizando resultados quando online');
}