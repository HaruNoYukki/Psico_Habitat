// --- GLOBAL VARIABLES ---
const GEMINI_API_KEY = "AIzaSyBaVBHIJ8tRrBi6U86-75MorEEnmJ44yJU";

var animo = '';

let advices = null;
let advice = null;
var adviceController = false;

let apps = null;

const installStatus = window.matchMedia('(display-mode: standalone)').matches ? 'installed' : 'not installed';

// --- 0. INSTANCIAS INICIALES ---
document.getElementById('btn-cancel-android').addEventListener('click', closeModal);
document.getElementById('btn-ready-ios').addEventListener('click', closeModal);

let deferredPrompt; // Variable para guardar el evento nativo
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;
});

// --- 1. SERVICE WORKER PARA FUNCION OFFLINE ---

if ('serviceWorker' in navigator) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });
    }
}

// --- 2. BASE DE DATOS LOCAL )(MOVER A UN JSON) ---
var bdRecursos = [
    { id: 1, tag: 'ansiedad', titulo: 'Playlist: Calma tu ansiedad', tipo: 'Web', link: 'https://open.spotify.com/playlist/6bT8zo10MdHsESTQNPXFW8?si=mqr7BTHLQBG7fPayRbniCw&pi=FOFcWn5zTGqt6' },
    { id: 2, tag: 'ansiedad', titulo: 'Playlist: Calm your Anxiety', tipo: 'Web', link: 'https://open.spotify.com/playlist/1y5R84CnSLoLcSRb4WCFAB?si=ZqrqfbMzQMSbRvvCUmN0vA&pi=efONrH3PQzGg8' },
    { id: 3, tag: 'ansiedad', titulo: 'App Rootd', tipo: 'App', link: "#", appCat: "Ansiedad", appName: "Rootd" },
    { id: 4, tag: 'tristeza', titulo: 'Línea de la Vida (24h)', tipo: 'Teléfono', link: 'tel:5551234567' },
    { id: 5, tag: 'tristeza', titulo: 'Playlist: Rayito de Sol', tipo: 'Web', link: "https://open.spotify.com/playlist/6Ud5HZrCWAaUrhAS3B1h0D?si=LNG5a0D9Q2KeonyOpTIy9g&pi=Q6D8v6ntRgWkL" },
    { id: 6, tag: 'tristeza', titulo: 'Playlist: Sunshine State of Mind', tipo: 'Web', link: 'https://open.spotify.com/playlist/5QGFrabx7xXp7RMlMAxXn5?si=xvZnAQ3DQv-zckg-h_nHAA&pi=TWGXySOBRnOyo' },
    { id: 7, tag: 'tristeza', titulo: 'App I am', tipo: 'App', link: '#', appCat: "Tristeza", appName: "Iam" },
    { id: 8, tag: 'soledad', titulo: 'Playlist: Voces Amigas', tipo: 'Web', link: 'https://open.spotify.com/playlist/4ijA8sf4ztxRjzlXEfWhb7?si=HEnHQgQRRT69fYnJ6Rg1gg&pi=icy9Z9pWR_-LH' },
    { id: 9, tag: 'soledad', titulo: 'Playlist: Company in the Echo', tipo: 'Web', link: 'https://open.spotify.com/playlist/4oFkgJLEcCj23LBpjqncdb?si=qW8WkBxISxeGDrPRWX2OkA&pi=Gb_zArkARdqFh' },
    //{ id: 6, tag: 'soledad', titulo: 'Comunidad Discord "Apoyo Mutuo"', tipo: 'Chat', link: '#' },
    { id: 10, tag: 'soledad', titulo: 'App Yana', tipo: 'App', link: "#", appCat: "Soledad", appName: "Yana" },
    { id: 11, tag: 'soledad', titulo: 'App Discord', tipo: 'App', link: "# ", appCat: "Soledad", appName: "Discord" },
    { id: 12, tag: 'panico', titulo: 'Botón de Emergencia SOS', tipo: 'Urgencia', link: 'tel:911' },
    { id: 13, tag: 'panico', titulo: 'App Rootd', tipo: 'App', link: "#", appCat: "Ansiedad", appName: "Rootd" },
];


function irA(sectionId) {
    console.log("Navegando a sección:", sectionId);
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    console.log("Sección activada:", sectionId);
    window.scrollTo(0, 0);
}

// --- 3. RECURSOS ---
function filtrarRecursos() {
    var estadoAnimo = animo;
    const contenedor = document.getElementById('resources-list');
    const titulo = document.getElementById('result-title');
    contenedor.innerHTML = '';
    if (adviceController) {
        adviceConstructor(animo);
        irA('resources-section');
    }
    const textos = {
        'ansiedad': 'Para calmar tu mente...',
        'tristeza': 'Un abrazo digital para ti...',
        'soledad': 'Conectemos con otros...',
        'panico': 'Respira, aquí tienes ayuda inmediata...'
    };
    titulo.innerText = textos[estadoAnimo] || 'Recursos para ti';

    const resultados = bdRecursos.filter(r => r.tag === estadoAnimo);

    if (resultados.length === 0) {
        contenedor.innerHTML = '<p>No encontramos recursos específicos.</p>';
    } else {
        resultados.forEach(item => {
            const card = `
                    <div class="resource-card">
                        <div class="resource-info">
                            <span class="resource-type">${item.tipo}</span>
                            <h3>${item.titulo}</h3>
                        </div>
                        `
                + (item.tipo === 'App' ? `<a href="${appConstructor(item.appCat, item.appName)}" class="btn-action">Descargar App</a>` :
                    `
                        <a href="${item.link}"no class="btn-action">Ver</a>
                    </div>
                `);
            contenedor.innerHTML += card;
        });
    }
    irA('resources-section');
}

// --- 4. LÓGICA DE REDIRECCIÓN Y TIMER ---
let timerInterval = null;

function prepararRedireccion() {
    const ciudadInput = document.getElementById('city-input').value.trim();

    if (!ciudadInput) {
        alert("Por favor, escribe una ciudad para buscar.");
        return;
    }

    // Mostrar Modal
    const modal = document.getElementById('redirect-modal');
    const timerDisplay = document.getElementById('countdown-timer');
    modal.style.display = 'flex';

    let timeLeft = 5;
    timerDisplay.innerText = timeLeft;

    // Iniciar Cuenta Regresiva
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            ejecutarRedireccion();
            // Ocultar modal después de un momento para que al volver no siga ahí
            setTimeout(() => { modal.style.display = 'none'; }, 1000);
        }
    }, 1000);
}

function ejecutarRedireccion() {
    const especialidad = document.getElementById('specialty-input').value;
    const ciudadInput = document.getElementById('city-input').value.trim();

    const ciudadFormateada = ciudadInput.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "-");

    const urlDestino = `https://www.doctoralia.com.mx/${especialidad}/${ciudadFormateada}`;

    window.open(urlDestino, '_self');
}

function cancelarRedireccion() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('redirect-modal').style.display = 'none';
}

// --- 5. ENCUESTA PREVIA A RECURSOS ---
function mostrarEncuesta(estadoAnimo) {
    animo = estadoAnimo;
    adviceController = false;
    irA('survey-section');
}

function seleccionarRazon(razon) {
    let data = advices[animo][razon];
    advice = data;
    adviceController = true;
    filtrarRecursos();
}

function adviceConstructor() {
    //insertando el contenedopr de consejos como hijo
    const contenedor = document.getElementById('resources-list');
    const contenedorConsejos = document.createElement('div');
    contenedor.appendChild(contenedorConsejos);
    //lógica de consejos
    let pasoActual = 0;
    function renderAdvice() {
        const item = advice[pasoActual]['advice'];
        const esElPrimero = pasoActual === 0;
        const esElUltimo = pasoActual === advice.length - 1;
        const adviceLength = advice.length;

        const htmlTemplate = `
            <div class="us">
                <h2>Un consejo para ti ❤️</h2>
                <p>${item}</p>
                ${adviceLength > 1 ? `<div class="btn-survey-grid">
                    <button id="btn-prev" class="btn-action" ${esElPrimero ? 'disabled' : ''}>
                        Anterior
                    </button>
                    <button id="btn-next" class="btn-action">
                        ${esElUltimo ? 'Inicio' : 'Siguiente →'}
                    </button>
                </div>`: ''}
            </div>
            `;
        //insertando el template en el contenedor
        contenedorConsejos.innerHTML = htmlTemplate;

        //eventos de los botones
        if (adviceLength <= 1) return;
        document.getElementById('btn-prev').onclick = () => {
            if (pasoActual > 0) {
                pasoActual--;
                renderAdvice();
            }

        }
        document.getElementById('btn-next').onclick = () => {
            if (pasoActual < advice.length - 1) {
                pasoActual++;
                renderAdvice();
            } else {
                pasoActual = 0;
                renderAdvice();
            }
        }
    }
    renderAdvice();
}

// --- 6. ACCESO DIRECTO A RECURSOS DESDE CRISIS ---
function accesoDirectoRecursos() {
    filtrarRecursos();
}
function accesosCrisis() {
    animo = 'panico';
    adviceController = false;
    filtrarRecursos();
}

// --- 7. CARGA DE CONSEJOS DESDE JSON ---
async function advicesData() {
    try {
        const data = await fetch('../advice/advices.json');
        advices = await data.json();
    } catch (error) {
        console.error("Error cargando datos de consejos:", error);
    }
}
advicesData();

// --- 8. CARGA DE APPS DESDE JSON ---
async function appsData() {
    try {
        const data = await fetch('../advice/Apps.json');
        apps = await data.json();
    } catch (error) {
        console.error("Error cargando datos de apps:", error);
    }
}
appsData();

// --- 9. SO DETECTOR Y APP CONTRUCTOR ---0
function detectSO() {
    const SO = navigator.userAgent || navigator.vendor || window.opera;
    return SO;
}

function appConstructor(appCat, appName) {
    const SO = detectSO();
    switch (true) {
        case /Android/i.test(SO):
            return apps[appCat][appName].linkA;
            break;

        case /iPad|iPhone|iPod/.test(SO) && !window.MSStream:
            return apps[appCat][appName].linkI;
            break;

        default:
            return apps[appCat][appName].linkW;
            break;
        
    }

}



//-- 10. LLAMADA A NUMEROS DE EMERGENCIA ---
function llamarTelefono(telefono) {
    window.location.href = telefono;
}

// --- 11. SERVICE WORKER PARA FUNCION OFFLINE ---


if ('serviceWorker' in navigator) {
    const CACHE_NAME = 'psicohabitat';
    // Archivos necesarios para la funcion offline
    const ASSETS_TO_CACHE = [
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/advice/Apps.json',
        '/advice/advices.json',
        '/assets/logo.png',
        '/offline.html' // Una página por si algo falla
    ];

    // 1. Instalación: Guardar todo en local
    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
        );
    });

    // 2. Priorisamos el offline
    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // El cache existe, de lo contrario, ir a internet
                return cachedResponse || fetch(event.request);
            })
        );
    });
}

async function requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`¿Almacenamiento persistido?: ${isPersisted}`);

        if (!isPersisted) {
            console.warn("El navegador denegó la persistencia. Se borrará si hay poco espacio.");
        }
    }
}

// --- 12. CONTENEDOR PARA FASES DE PRUEBA ---
function dismissBanner() {
    const banner = document.getElementById('beta-banner');
    if (banner) {
        banner.style.display = 'none';
        // Opcional: Guardar en localStorage para que no aparezca en cada refresh
        localStorage.setItem('psicohabitat_beta_dismissed', 'true');
    }
}

window.onload = () => {
    if (localStorage.getItem('psicohabitat_beta_dismissed') === 'true') {
        document.getElementById('beta-banner').style.display = 'none';
    }
};
// --- 13. FUNCIÓN DE INSTALACIÓN CONTEXTUAL ---

if (window.matchMedia('(display-mode: standalone)').matches) {
    requestPersistence();
    document.getElementById('install-btn').style.display = 'none';
}

function instalarApp() {
    let SO = detectSO();
    switch (true) {
        case /Android|Chrome|!!window.chrome/i.test(SO):
            const modalAndroid = document.getElementById('pwa-android-modal');
            openModal(modalAndroid);
        break;

        case /iPad|iPhone|iPod|Mac/.test(SO) && !window.MSStream:
            const modalIOS = document.getElementById('pwa-ios-modal');
            openModal(modalIOS);
        break;

        default:
            alert("Tu dispositivo no soporta instalación directa. Puedes usar la versión web desde tu navegador.");
        break;
    }
}

function openModal(modalElement){
    let backdrop = document.getElementById('pwa-backdrop');
    backdrop.style.display = 'block';
    modalElement.style.display = 'block';
    
    void modalElement.offsetWidth; 

    backdrop.classList.add('active');
    modalElement.classList.add('active');
}

function closeModal(){
    let backdrop = document.getElementById('pwa-backdrop');
    let modalAndroid = document.getElementById('pwa-android-modal');
    let modalIOS = document.getElementById('pwa-ios-modal');

    backdrop.classList.remove('active');
    modalAndroid.classList.remove('active');
    modalIOS.classList.remove('active');

    setTimeout(() => {
        backdrop.style.display = 'none';
        modalAndroid.style.display = 'none';
        modalIOS.style.display = 'none';
    }, 300);
}

function installNativeDialog() {
    if (deferredPrompt) {
        deferredPrompt.prompt();   
    }
    closeModal();
}

// --- 13 COSITOS DE GEMINI ---
// Función helper para llamar a Gemini
async function callGemini(promptText) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        });

        if (!response.ok) throw new Error('Error en la API');

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error llamando a Gemini:", error);
        return null;
    }
}

// --- NUEVO: FUNCIÓN DE CONSEJO PERSONALIZADO (IA) ---
async function consultarIA() {
    const input = document.getElementById('ai-mood-input').value.trim();
    const resultBox = document.getElementById('ai-response-container');

    if (!input) {
        alert("Por favor, escribe brevemente cómo te sientes.");
        return;
    }

    // Estado de carga
    resultBox.style.display = 'block';
    resultBox.innerText = "✨ Conectando con tu guía interior... (Procesando)";

    const prompt = `
            Actúa como un consejero de salud mental empático y cálido llamado "PsicoGuía".
            El usuario dice: "${input}".
            
            Tu tarea:
            1. Valida sus sentimientos en 1 o 2 frases cortas y cálidas.
            2. Sugiere UNA acción inmediata muy simple (respiración, tomar agua, ver el cielo).
            3. Mantén el tono suave, no médico, sino de acompañamiento.
            4. Responde en Español.
        `;

    const respuesta = await callGemini(prompt);

    if (respuesta) {
        resultBox.innerText = respuesta;
    } else {
        resultBox.innerText = "Lo siento, la conexión con la guía falló. Intenta respirar profundo y probar de nuevo.";
    }
}

// --- NUEVO: FUNCIÓN DE MISIÓN ECOLÓGICA MÁGICA (IA) ---
async function generarMisionIA() {
    const missionText = document.getElementById('green-mission-text');

    missionText.innerText = "✨ Creando misión mágica...";

    const prompt = `
            Genera una "micro-misión ecológica" única para una persona que busca bienestar.
            Debe ser:
            1. Muy fácil de hacer en menos de 5 minutos.
            2. Conectada con la naturaleza o el cuidado del entorno.
            3. Con un tono poético o inspirador.
            4. Máximo 15 palabras.
            
            Ejemplos: "Encuentra una hoja seca y agradece su ciclo de vida", "Riega una planta y dile palabras de aliento".
        `;

    const respuesta = await callGemini(prompt);

    if (respuesta) {
        // Limpiamos comillas extra si la IA las pone
        missionText.innerText = `"${respuesta.replace(/"/g, '')}"`;
    } else {
        missionText.innerText = '"Abraza un árbol cercano y siente su calma."';
    }
}

// --- 14. VIDEOJUEGO ---

   // --- ASSETS Y DEFINICIONES ---    
    // Lo que SÍ se debe recoger
    const TRASH_TYPES = [
    { type: 'organic', icon: '../img/trashIcons/1.png'},
    { type: 'recyclable', icon: '../img/trashIcons/2.png'},
    { type: 'recyclable', icon: '../img/trashIcons/3.png'},
    { type: 'recyclable', icon: '../img/trashIcons/4.png'},
    { type: 'inorganic', icon: '../img/trashIcons/5.png'},
    { type: 'inorganic', icon: '../img/trashIcons/6.png'},
    { type: 'organic', icon: '../img/trashIcons/7.png'} // Cambiado
    ];
    // Lo que NO se debe recoger (Esquivar)
    const LIFE_TYPES = [
    { type: 'life', icon: '../img/lifeIcons/0.png'}, 
    { type: 'life', icon: '../img/lifeIcons/1.png'}, 
    { type: 'life', icon: '../img/lifeIcons/2.png'}, // fa-bird era Pro, fa-crow es Free
    { type: 'life', icon: '../img/lifeIcons/3.png'},
    { type: 'life', icon: '../img/lifeIcons/4.png'}, // fa-bugs era nuevo, fa-bug es clásico
    { type: 'life', icon: '../img/lifeIcons/5.png'} // Cambiado
    ];

    // Combinación de ítems para el spawn (70% basura, 30% vida)
    const SPAWN_ITEMS = [
        ...TRASH_TYPES.map(item => ({ ...item, isTrash: true })),
        ...LIFE_TYPES.map(item => ({ ...item, isTrash: false })),
        ...LIFE_TYPES.map(item => ({ ...item, isTrash: false })) // Duplicate life to increase spawn chance
    ];

    // --- VARIABLES DE ESTADO ---
    let state = {
        score: 0, lives: 3, round: 1,
        totalCaught: 0, totalSortedCorrectly: 0,
        trashCaughtThisRound: [], // Objetos de basura atrapados
        trashToSpawnThisRound: 5, trashSpawned: 0,
        speedMultiplier: 1, isPlaying: false, animationId: null
    };

    // Referencias al DOM
    const gameContainer = document.getElementById('game-container');
    const catchPhase = document.getElementById('catch-phase');
    const sortPhase = document.getElementById('sort-phase');
    const gameOverPhase = document.getElementById('game-over');
    const rulesPhase = document.getElementById('rules-phase');
    const player = document.getElementById('player');
    
    let playerX = gameContainer.clientWidth / 2;
    const playerWidth = 50; // Aprox 3.2rem

    // --- LÓGICA DE MOVIMIENTO ---
    function movePlayer(clientX) {
        if (!state.isPlaying) return;
        const containerRect = gameContainer.getBoundingClientRect();
        let newX = clientX - containerRect.left;
        
        // Límites
        if (newX < playerWidth/2) newX = playerWidth/2;
        if (newX > containerRect.width - playerWidth/2) newX = containerRect.width - playerWidth/2;
        
        playerX = newX;
        player.style.left = `${playerX}px`;
    }

    // Soporte Mouse y Touch (crucial: passive false)
    catchPhase.addEventListener('touchmove', (e) => {
        movePlayer(e.touches[0].clientX);
        if(e.cancelable) e.preventDefault(); 
    }, {passive: false});
    catchPhase.addEventListener('mousemove', (e) => movePlayer(e.clientX));

    // --- LOOP PRINCIPAL (Fase 1) ---
    let lastSpawnTime = 0;
    let spawnInterval = 1600; 
    let activeItems = []; // Objetos cayendo

    function gameLoop(timestamp) {
        if (!state.isPlaying) return;

        // Spawn
        if (timestamp - lastSpawnTime > spawnInterval && state.trashSpawned < state.trashToSpawnThisRound) {
            spawnFallingItem();
            lastSpawnTime = timestamp;
            state.trashSpawned++;
        }

        // Mover y colisiones
        for (let i = activeItems.length - 1; i >= 0; i--) {
            const item = activeItems[i];
            const currentY = parseFloat(item.element.style.top) || 0;
            // Velocidad base 3px + multiplicador por ronda
            const newY = currentY + (3 * state.speedMultiplier); 
            item.element.style.top = `${newY}px`;

            const playerRect = player.getBoundingClientRect();
            const itemRect = item.element.getBoundingClientRect();

            // 1. Atrapado (Colisión con jugador)
            if (isColliding(playerRect, itemRect)) {
                catchPhase.removeChild(item.element);
                activeItems.splice(i, 1);
                
                if (item.data.isTrash) {
                    // PUNTO CORRECTO
                    state.score += 100;
                    state.totalCaught++;
                    state.trashCaughtThisRound.push(item.data);
                    // Feedback visual (pulso verde opcional)
                } else {
                    // PUNTO INCORRECTO: ¡Tocó vida!
                    state.lives--;
                    if (state.lives <= 0) { endGame(); return; }
                    flashScreen('rgba(231, 76, 60, 0.4)'); // Feedback rojo
                }
                
                updateUI();
                checkRoundEnd();
                continue;
            }

            // 2. Esquivado / Perdido (Suelo)
            // -45 para que se "meta" un poco en la tierra
            if (newY > catchPhase.clientHeight - 45) { 
                catchPhase.removeChild(item.element);
                activeItems.splice(i, 1);
                
                if (item.data.isTrash) {
                    // PERDIÓ BASURA
                    state.lives--;
                    if (state.lives <= 0) { endGame(); return; }
                    flashScreen('rgba(139, 69, 19, 0.4)'); // Feedback café/tierra
                } else {
                    // ESQUIVÓ VIDA (Correcto)
                    // Podrías sumar un puntaje pequeño aquí si quieres
                }
                
                updateUI();
                checkRoundEnd();
            }
        }

        state.animationId = requestAnimationFrame(gameLoop);
    }

    function isColliding(rect1, rect2) {
        // Reducimos un poco la hitbox para que no sea tan injusto en móvil
        const padding = 5;
        return !(rect1.right - padding < rect2.left + padding || 
                 rect1.left + padding > rect2.right - padding || 
                 rect1.bottom - padding < rect2.top + padding || 
                 rect1.top + padding > rect2.bottom - padding);
    }

    function spawnFallingItem() {
        // Seleccionar al azar de SPAWN_ITEMS
        const randomData = SPAWN_ITEMS[Math.floor(Math.random() * SPAWN_ITEMS.length)];
        
        const el = document.createElement('img'); // Ahora creamos una imagen real  
        el.src = randomData.icon;                 // Le asignamos la ruta de tu array
        el.className = 'falling-item';            // Mantenemos la clase de físicas y posición
        el.style.zIndex = "5";

        const containerWidth = document.getElementById('game-container').offsetWidth ;
        // Padding de 20px para no nacer pegado a la pared
        const safetyMargin = 40;
        const randomX = Math.random() * (containerWidth - (safetyMargin * 2)) + safetyMargin;
        
        el.style.left = `${randomX}px`;
        el.style.top = '-60px'; // Nace arriba
        
        catchPhase.appendChild(el);
        activeItems.push({ element: el, data: randomData });
    }

    function checkRoundEnd() {
        if (state.trashSpawned >= state.trashToSpawnThisRound && activeItems.length === 0) {
            state.isPlaying = false;
            cancelAnimationFrame(state.animationId);
            
            // Pausa antes de la fase de clasificación o siguiente ronda
            setTimeout(() => {
                if (state.trashCaughtThisRound.length > 0) {
                    startSortingPhase();
                } else {
                    nextRound();
                }
            }, 500);
        }
    }

    // Feedback visual al perder vida
    function flashScreen(color) {
        catchPhase.style.backgroundColor = color;
        setTimeout(() => {
            catchPhase.style.backgroundColor = 'transparent';
        }, 150);
    }

    // --- FASE 2: CLASIFICACIÓN ---
    let currentSortIndex = 0;

    function startSortingPhase() {
        sortPhase.classList.add('active-screen');
        currentSortIndex = 0;
        showNextItemToSort();
    }

    function showNextItemToSort() {
        if (currentSortIndex >= state.trashCaughtThisRound.length) {
            // Terminó clasificación
            sortPhase.classList.remove('active-screen');
            nextRound();
            return;
        }

        const item = state.trashCaughtThisRound[currentSortIndex];
        const iconEl = document.getElementById('item-to-sort');
        
        // Usamos una etiqueta img. Puedes ajustar los px a lo que se vea mejor en tu diseño
        iconEl.innerHTML = `<img src="${item.icon}" alt="Basura" style="width: 120px; height: auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));">`;
        document.getElementById('sort-progress').innerText = `${currentSortIndex + 1} / ${state.trashCaughtThisRound.length}`;
    }

    function checkSort(selectedType) {
        const item = state.trashCaughtThisRound[currentSortIndex];
        
        if (selectedType === item.type) {
            state.totalSortedCorrectly++;
            // Feedback correcto (podrías animar el ícono)
        } else {
            // INCORRECTO
            state.score -= 50;
            if (state.score < 0) state.score = 0; 
            // Podrías vibrar o poner ícono en rojo
        }

        updateUI();
        currentSortIndex++;
        
        setTimeout(showNextItemToSort, 250);
    }

    // --- TRANSICIONES Y RESTART ---
    function nextRound() {
        state.round++;
        state.trashCaughtThisRound = [];
        state.trashSpawned = 0;
        
        // Aumentar dificultad
        state.trashToSpawnThisRound += 2; // Más ítems
        state.speedMultiplier += 0.2; // Más rápido base
        // Tope de velocidad 500ms
        spawnInterval = Math.max(500, spawnInterval - 120); 

        updateUI();
        state.isPlaying = true;
        lastSpawnTime = performance.now();
        state.animationId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        state.isPlaying = false;
        cancelAnimationFrame(state.animationId);
        
        // Limpiar ítems
        activeItems.forEach(t => catchPhase.removeChild(t.element));
        activeItems = [];

        // Llenar stats
        document.getElementById('go-score').innerText = state.score;
        // Rondas completadas es ronda actual - 1 (a menos que pierda en interronda)
        document.getElementById('go-rounds').innerText = state.round - 1;
        document.getElementById('go-caught').innerText = state.totalCaught;
        document.getElementById('go-sorted').innerText = state.totalSortedCorrectly;

        gameOverPhase.classList.add('active-screen');
    }

    // Función inicial para el botón del popup de reglas
    function startGame() {
        rulesPhase.classList.remove('active-screen');
        // Reset state por si acaso
        state = {
            score: 0, lives: 3, round: 1, totalCaught: 0, totalSortedCorrectly: 0,
            trashCaughtThisRound: [], trashToSpawnThisRound: 5, trashSpawned: 0,
            speedMultiplier: 1, isPlaying: true, animationId: null
        };
        spawnInterval = 1600;
        
        lastSpawnTime = performance.now();
        updateUI();
        state.animationId = requestAnimationFrame(gameLoop);
    }

    // Función para el botón de jugar de nuevo
    function resetGame() {
        gameOverPhase.classList.remove('active-screen');
        sortPhase.classList.remove('active-screen');
        // Volver a mostrar reglas para reiniciar el flujo limpio
        rulesPhase.classList.add('active-screen');
        console.log("Juego reiniciado, esperando a que el jugador lea las reglas y presione jugar.");
        updateUI();
    }

    function updateUI() {
        document.getElementById('ui-score').innerText = state.score;
        document.getElementById('ui-lives').innerText = state.lives;
        document.getElementById('ui-round').innerText = state.round;
    }

    // Al cargar, centrar jugador y UI, pero esperar a startGame
    window.onload = () => {
        const containerWidth = gameContainer.clientWidth;
        playerX = containerWidth / 2;
        player.style.left = `${playerX}px`;
        updateUI();
    };

// --- 15. CUESTIONARIO DE AUTODIAGNÓSTICO ---

    //vaiables para el cuestionario
    let scores = {
    Depresion: 0,
    Ansiedad: 0
    };

    let QuestionnaireData = null;
    let currentQuestionIndex = 0;


    const levels = [
    { min: 0, max: 4, mensajed: "Tus variaciones de ánimo están dentro de lo habitual. No hay signos claros de depresión.", mensajea:"Tu nivel de tensión está dentro de lo normal. Manejas el estrés cotidiano sin que se descontrole." },
    { min: 5, max: 9, mensajed: "Presentas indicios de depresión leve a moderada. Es posible que estés pasando por una racha de desánimo que empieza a afectar tu energía.", mensajea: " Presentas indicios de ansiedad leve a moderada. Estás experimentando picos de estrés, nerviosismo y sobrepensamiento que no te dejan descansar bien." },
    { min: 10, max: 15, mensajed: "Presentas indicios fuertes de un cuadro depresivo. Tu estado de ánimo está afectando significativamente tu calidad de vida, tu energía y tu visión de ti mismo/a.", mensajea : " Presentas indicios fuertes de un trastorno de ansiedad. Tu sistema de alerta está hiperactivo, causándote miedo, tensión física constante y dificultad severa para relajarte." },
    ]

    async function loadQuestionnaire() {
    try {
        const data = await fetch('../advice/Questionnaire.json');
        QuestionnaireData = await data.json();
    } catch (error) {
        console.error("Error cargando cuestionario:", error);
    }
    }
    loadQuestionnaire();


    function startQuestionnaire() {
    let QsectionBtn = document.getElementById('questionnaire-section-btn');
    QsectionBtn.style.display = 'none';
    let Qresponses = document.getElementById('questionnaire-responses');
    Qresponses.style.display = 'flex';
    renderQuestionnaire();
    }


    function renderQuestionnaire() {
    const Qdescription = document.getElementById('questionnaire-description');
    if (currentQuestionIndex == QuestionnaireData.length) {
        let results = showresults();
        renderResults(results);
        return;
    }
    cleanRadios();
    Qdescription.innerText = QuestionnaireData[currentQuestionIndex].texto; // Primera pregunta
    }

    function selectAnswer(score) {
    const categoriaActual = QuestionnaireData[currentQuestionIndex].categoria;
    scores[categoriaActual] += score;
    currentQuestionIndex++;
    renderQuestionnaire();
    }

    function showresults() {
    const descDepresion = levels.find(rango => scores.Depresion <= rango.max)?.mensajed || "Puntaje fuera de rango"; 
    const descAnsiedad = levels.find(rango => scores.Ansiedad <= rango.max)?.mensajed || "Puntaje fuera de rango"; 

    const esAltoS1 = scores.Depresion > 9;
    const esAltoS2 = scores.Ansiedad > 9;

    const interpretaciones = {
        "true-true":"Es altamente probable que estés experimentando un cuadro mixto ansioso-depresivo. Esto es muy común, ya que la ansiedad prolongada suele agotar la energía y derivar en depresión, y viceversa. En este escenario, buscar apoyo terapéutico es el mejor paso a seguir.",
        "true-false":"Tu perfil se inclina hacia la depresión.",
        "false-true":"Tu perfil se inclina hacia la ansiedad.",
        "false-false":"No se identifican indicios claros de depresión o ansiedad en tu caso."
    };

    const resultadoFinal = interpretaciones[`${esAltoS1}-${esAltoS2}`] || "Resultado no interpretable.";

    return{
        depresion: descDepresion,
        ansiedad: descAnsiedad,
        resultadoFinal: resultadoFinal
    }
    }

    function renderResults(results) {
    let Qresponses = document.getElementById('questionnaire-responses');
    Qresponses.style.display = 'none';
    const Qdescription = document.getElementById('questionnaire-description');
    Qdescription.innerText = `Resultados:\n\nDepresión: ${results.depresion}\n\nAnsiedad: ${results.ansiedad}\n\n${results.resultadoFinal}`;
    }

    function cleanRadios() {
  // Cambia "nombreDelGrupo" por el atributo 'name' que tengan tus inputs
  const opciones = document.querySelectorAll('input[name="opt"]');
  opciones.forEach(opcion => {
    opcion.checked = false;
  });
    }