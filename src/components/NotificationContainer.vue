<!-- src/components/NotificationContainer.vue -->
<template>
  <!-- Contenedor fijo para las notificaciones en la esquina superior derecha -->
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6"
  >
    <div class="flex w-full flex-col items-end space-y-3">
      <!-- Usamos TransitionGroup para animar la entrada y salida de notificaciones -->
      <TransitionGroup
        tag="div"
        name="notification"
        class="w-full max-w-sm"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div class="p-4">
            <div class="flex items-start">
              <!-- Icono dinámico según el tipo de notificación -->
              <div class="flex-shrink-0">
                <span
                  :class="typeClasses[notification.type].iconColor"
                  class="material-symbols-outlined h-6 w-6"
                  aria-hidden="true"
                >
                  {{ typeIcons[notification.type] }}
                </span>
              </div>
              <!-- Mensaje de la notificación -->
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">
                  {{ typeClasses[notification.type].title }}
                </p>
                <p class="mt-1 text-sm text-gray-500">
                  {{ notification.message }}
                </p>
              </div>
              <!-- Botón para cerrar -->
              <div class="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  @click="removeNotification(notification.id)"
                  class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="sr-only">Cerrar</span>
                  <span class="material-symbols-outlined h-5 w-5" aria-hidden="true">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// Asegúrate de que la ruta a tu emisor sea correcta
import { emitter } from '@utils/Emitter';

// --- Definición de Tipos ---
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: symbol;
  type: NotificationType;
  message: string;
  duration: number;
  timeoutId?: number; // Para poder cancelar el cierre automático
}

interface NotificationPayload {
  type: NotificationType;
  message: string;
  duration?: number;
}

// --- Estado Reactivo ---
const notifications = ref<Notification[]>([]);

// --- Clases y Mapeos de Estilos ---
const typeClasses = {
  success: { title: 'Éxito', iconColor: 'text-green-500' },
  error: { title: 'Error', iconColor: 'text-red-500' },
  warning: { title: 'Advertencia', iconColor: 'text-yellow-500' },
  info: { title: 'Información', iconColor: 'text-blue-500' },
};

const typeIcons = {
  success: 'check_circle',
  error: 'cancel',
  warning: 'warning',
  info: 'info',
};

// --- Funciones ---
const addNotification = (payload: NotificationPayload) => {
  const id = Symbol('notification-id');
  const duration = payload.duration || 5000; // 5 segundos por defecto

  const newNotification: Notification = {
    id,
    type: payload.type,
    message: payload.message,
    duration,
  };

  // Cierre automático
  newNotification.timeoutId = window.setTimeout(() => {
    removeNotification(id);
  }, duration);

  notifications.value.unshift(newNotification); // Añadir al principio para que aparezcan arriba
};

const removeNotification = (id: symbol) => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    // Limpiar el timeout si se cierra manualmente para evitar errores
    clearTimeout(notifications.value[index].timeoutId);
    notifications.value.splice(index, 1);
  }
};

// --- Ciclo de Vida y Listener del Emitter ---
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  // Nos suscribimos al evento 'show-notification' cuando el componente se monta
  unsubscribe = emitter.on('show-notification', (payload: NotificationPayload) => {
    addNotification(payload);
  });
});

onUnmounted(() => {
  // Nos desuscribimos para evitar fugas de memoria cuando el componente se destruye
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<!-- Estilos para la animación de entrada y salida -->
<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>