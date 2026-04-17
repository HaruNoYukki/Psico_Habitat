<div align="center">
  <img src="img/icon.png" alt="Psicohábitat Logo" width="120" />
  <h1>🍃 Psicohábitat</h1>
  <p><em>Tu espacio de calma y conexión</em></p>
  
  [![Estado](https://img.shields.io/badge/Estado-BETA-blueviolet.svg)](#)
  [![PWA](https://img.shields.io/badge/PWA-Ready-success.svg)](#)
  [![IA](https://img.shields.io/badge/IA-Google_Gemini-orange.svg)](#)
</div>

---

> **Psicohábitat** es una Progressive Web App (PWA) diseñada para ser un refugio digital. Nuestra misión es ofrecer un espacio donde los adolescentes y jóvenes puedan encontrar apoyo emocional, recursos y herramientas para cuidar su salud mental, todo mientras se fomenta una conexión consciente con nuestro entorno natural y el medio ambiente.

## ✨ Características Principales

* 🧘 **Acompañamiento Emocional:** Selecciona cómo te sientes hoy (tristeza, ansiedad, soledad o crisis de pánico) y descubre recursos personalizados (playlists, apps recomendadas como Rootd, Yana, etc.).
* 🤖 **PsicoGuía (IA con Gemini):** Un compañero virtual impulsado por la API de Google Gemini que te escucha, valida tus sentimientos y te brinda consejos cálidos, cortos y reconfortantes al instante.
* 🆘 **Líneas de Ayuda (México):** Acceso rápido y directo a números de emergencia y atención psicológica gratuita (Línea de la Vida, 911, SAPTEL, etc.).
* 📋 **Cuestionario de Autoconocimiento:** Una pequeña herramienta de reconocimiento opcional para identificar posibles niveles de ansiedad y depresión.
* 🌱 **Misiones Ecológicas Mágicas:** La IA genera pequeñas acciones diarias y poéticas para cuidar el planeta en menos de 5 minutos. *¡Sanar tu mente y sanar nuestro entorno van de la mano!*
* 🎮 **Mini-juego Ecológico:** Un juego interactivo donde ayudas a limpiar el hábitat atrapando basura, clasificándola correctamente (orgánica, inorgánica, reciclable) y protegiendo a la flora y fauna local.
* 👨‍⚕️ **Directorio de Especialistas:** Búsqueda rápida y redirección a Doctoralia para encontrar profesionales de la salud mental en tu ciudad.
* 📱 **Instalable (PWA):** Descarga la app en tu celular (Android/iOS) para llevar tu bienestar emocional a todas partes, con soporte offline para recursos clave.

## 🛠️ Tecnologías y Herramientas

* **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+).
* **Inteligencia Artificial:** [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`) para respuestas empáticas y generación de misiones ecológicas.
* **PWA:** Service Workers (`sw.js`), `manifest.json`, Local Storage y Cache API para funcionamiento offline.
* **Diseño e Interfaz:** FontAwesome (iconos), Google Fonts (Fredoka y Open Sans).

## 🚀 Instalación y Uso Local

Al ser una aplicación web estática (Vanilla), su ejecución es sumamente sencilla:

1. **Clona este repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/Psico_Habitat.git
   ```
2. **Abre el proyecto:**
   Simplemente abre el archivo `index.html` en tu navegador preferido. Si deseas probar las características de PWA (Service Workers), te recomendamos usar una extensión como **Live Server** en VS Code o iniciar un servidor local:
   ```bash
   npx serve .
   ```
3. **Configuración de IA:** 
   El proyecto utiliza una API Key de Gemini en `js/script.js`. Para un uso en producción, asegúrate de reemplazarla por tu propia clave y gestionar su seguridad adecuadamente.
4. **Instalación en Móvil:** 
   Al alojar la web, ábrela desde el navegador de tu dispositivo móvil y selecciona la opción "Instalar App" o "Añadir a la pantalla de inicio".

## 📂 Estructura del Proyecto

```text
📦 Psico_Habitat
 ┣ 📂 advice        # JSONs de la base de datos (Consejos, Apps, Cuestionarios)
 ┣ 📂 img           # Recursos gráficos (iconos, basura, vidas del minijuego)
 ┣ 📂 js            # Lógica principal (script.js) con IA, PWA y el juego
 ┣ 📂 style         # Hojas de estilo (base.css)
 ┣ 📜 index.html    # Vista principal y estructura de la app
 ┣ 📜 manifest.json # Manifiesto para la Progressive Web App
 ┗ 📜 sw.js         # Service Worker para el manejo de caché offline
```

## 🤝 Sobre los Autores

Creado con 💚 por **Andrea** y **Sergio**, dos jóvenes apasionados por la psicología, la tecnología y el bienestar integral. 

## 📄 Licencia

Consulta el archivo `LICENSE` en este repositorio para obtener más detalles sobre la licencia del proyecto.

---
<div align="center">
  <em>«Creemos que el bienestar personal está intrínsecamente ligado a la salud del planeta. En Psicohábitat, cada acción cuenta: cuidar de tu mente es cuidar de nuestro hábitat común.»</em> 🌱
</div>