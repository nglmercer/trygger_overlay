# Media Organization Tool

Herramienta para organizar elementos multimedia y crear drafts para publicaciones como YouTube. Este proyecto ha sido refactorizado para enfocarse exclusivamente en la organización de contenido multimedia.

## Características

- **Galería Multimedia**: Organiza y visualiza imágenes, videos y archivos de audio
- **Reproductor Multimedia**: Reproduce diferentes tipos de medios con controles avanzados
- **Gestión de Drafts**: Crea y organiza drafts para publicaciones
- **Interfaz Intuitiva**: Diseño responsive y fácil de usar
- **Gestión de Audio**: Soporte completo para reproducción de audio con permisos automáticos

## Estructura del Proyecto

```
src/
├── components/
│   ├── content/           # Componentes de contenido multimedia
│   │   ├── MediaGallery.vue
│   │   └── TabContent.vue
│   ├── media/            # Componentes de gestión de medios
│   │   ├── upload.vue
│   │   ├── SearchInput.vue
│   │   └── ViewToggle.vue
│   ├── widget/           # Componentes del reproductor
│   │   ├── MediaPlayer.vue
│   │   ├── MediaDisplay.vue
│   │   ├── MediaControls.vue
│   │   └── MediaInfo.vue
│   ├── MainContent.vue   # Contenido principal
│   └── NotificationContainer.vue
├── config/
│   ├── events.ts         # Configuración de eventos
│   └── tabs.ts          # Configuración de pestañas
├── utils/
│   ├── fetch/           # Utilidades de API
│   ├── Emitter.ts       # Sistema de eventos
│   └── brodcast.ts      # Comunicación entre ventanas
└── pages/
    ├── index.astro      # Página principal
    └── widget.astro     # Widget de reproducción
```

## Uso

### Galería Multimedia
1. Navega entre las pestañas: Images, Videos, Sounds
2. Sube archivos usando el botón de añadir
3. Organiza tus archivos en categorías
4. Usa la búsqueda y filtros para encontrar contenido específico

### Reproductor Multimedia
1. Selecciona un elemento multimedia de la galería
2. Usa los controles de reproducción estándar
3. Ajusta volumen y configuración de audio
4. Visualiza información del medio

### Drafts
1. Crea nuevos drafts para publicaciones
2. Organiza contenido por proyectos
3. Añade notas y descripciones
4. Prepara contenido para YouTube u otras plataformas

## Tecnologías

- **Astro**: Framework principal
- **Vue 3**: Componentes interactivos
- **TypeScript**: Tipado seguro
- **Tailwind CSS**: Estilos responsive
- **Web Components**: Componentes ligeros

## Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar producción
npm run preview
```

## Configuración

La configuración principal se encuentra en:
- `src/config/events.ts`: Eventos del sistema
- `src/config/tabs.ts`: Configuración de pestañas
- `src/utils/fetch/config/apiConfig.ts`: Configuración de API

## Licencia

Proyecto open source para organización de contenido multimedia.
