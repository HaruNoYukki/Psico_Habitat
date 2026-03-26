// --- GEMINI API SETUP ---
const GEMINI_API_KEY = "AIzaSyBaVBHIJ8tRrBi6U86-75MorEEnmJ44yJU";

var animo = '';

let advices = null;
let advice = null;
var adviceController = false;

let apps = null;


document.getElementById('btn-cancel-android').addEventListener('click', closeModal);
document.getElementById('btn-ready-ios').addEventListener('click', closeModal);

let deferredPrompt; // Variable para guardar el evento nativo
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;
});

// --- 1. BASE DE DATOS LOCAL )(MOVER A UN JSON) ---
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

requestPersistence();

if (window.matchMedia('(display-mode: standalone)').matches) {
    // Aquí es donde tienes más chance de que Safari diga que sí
    requestPersistence();
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
