// src/config/tabs.ts

// 1. Definición de las pestañas que se mostrarán en la UI.
// La propiedad 'active' aquí solo sirve para definir el estado inicial por defecto.
const tabsNames = ['Images', 'Videos', 'Sounds', 'Groups'] as const;
export type TabName = typeof tabsNames[number];

export const tabs = [
  { label: "Images", active: true },
  { label: "Videos", active: false },
  { label: "Sounds", active: false },
  { label: "Groups", active: false },
] as const;

export interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: string;
}

export type EmptyStateConfigKeys = {
  [K in TabName]: EmptyStateConfig;
};

export const emptyStateConfig: EmptyStateConfigKeys = {
  Images: {
    icon: 'photo_library',
    title: 'No images found',
    description: 'Upload your first image to get started',
    buttonText: 'Upload image',
    buttonIcon: 'upload_file',
  },
  Videos: {
    icon: 'video_library',
    title: 'No videos found',
    description: 'Upload your first video to get started',
    buttonText: 'Upload video',
    buttonIcon: 'upload_file',
  },
  Sounds: {
    icon: 'audio_file',
    title: 'No sounds found',
    description: 'Upload your first sound to get started',
    buttonText: 'Upload sound',
    buttonIcon: 'upload_file',
  },
  Groups: {
    icon: 'group',
    title: 'No groups found',
    description: 'Upload your first group to get started',
    buttonText: 'Upload group',
    buttonIcon: 'upload_file',
  },
} as const;
// 2. Definición de las clases de Tailwind CSS

// Clases comunes para CUALQUIER pestaña, sea activa o no.
const baseClass = "flex-1 min-w-[90px] flex flex-col-reverse items-center justify-center text-sm font-medium uppercase tracking-wide px-4 transition";

// Clases que se AÑADEN solo cuando la pestaña está ACTIVA.
const activeClass = "text-[rgb(110,121,255)] bg-[rgb(50,50,50)] font-bold";

// Clases que se AÑADEN solo cuando la pestaña está INACTIVA.
const inactiveClass = "text-white/60 bg-[rgb(50,50,50)]";


// 3. Objeto que exporta las clases para ser consumidas por los componentes.
export const TabClassnames = {
  base: baseClass,
  active: activeClass,
  inactive: inactiveClass,
};
export const typeToTabNameMap: Record<string, TabName> = {
  'image': 'Images',
  'video': 'Videos',
  'audio': 'Sounds',
  'groups': 'Groups',
};