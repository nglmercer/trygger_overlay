// src/config/tabs.ts

// 1. Definición de las pestañas que se mostrarán en la UI.
// La propiedad 'active' aquí solo sirve para definir el estado inicial por defecto.
export const tabs = [
  { label: "Images", active: true },
  { label: "Videos" },
  { label: "Sounds" },
  { label: "OBS" },
  { label: "Groups" },
];

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