<template>
    <dlg-cont ref="configModal" @close="closeConfigModal">
        <div class="config-modal">
            <h2>Configurar API</h2>
            
            <form @submit.prevent="saveConfig" class="config-form">
                <!-- Protocolo -->
                <div class="form-group">
                    <label for="protocol">Protocolo:</label>
                    <select 
                        id="protocol" 
                        v-model="localConfig.protocol"
                        required
                    >
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                    </select>
                </div>

                <!-- Hostname -->
                <div class="form-group">
                    <label for="hostname">Hostname:</label>
                    <input 
                        type="text" 
                        id="hostname"
                        v-model="localConfig.host"
                        placeholder="127.0.0.1"
                        required
                    />
                </div>

                <!-- Puerto -->
                <div class="form-group">
                    <label for="port">Puerto:</label>
                    <input 
                        type="number" 
                        id="port"
                        v-model.number="localConfig.port"
                        placeholder="3000"
                        min="1"
                        max="65535"
                        required
                    />
                </div>

                <!-- URL Completa (solo lectura) -->
                <div class="form-group">
                    <label for="fullUrl">URL Completa:</label>
                    <input 
                        type="text" 
                        id="fullUrl"
                        :value="getPreviewUrl()"
                        readonly
                        class="readonly-input"
                    />
                </div>
                <!-- Botones -->
                <div class="button-group">
                    <button type="button" @click="resetConfig" class="btn btn-secondary">
                        Restablecer
                    </button>
                    <button type="button" @click="reloadFromStorage" class="btn btn-info">
                        Recargar
                    </button>
                    <button type="button" @click="closeConfigModal" class="btn btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    </dlg-cont>
</template>

<script setup lang="ts">
import { apiConfig } from '@utils/fetch/fetchapi';
import { onMounted, ref, reactive, computed } from 'vue';
import { DlgCont } from '@litcomponents/modal';

const configModal = ref<DlgCont|null>(null);

// Estado local del formulario
const localConfig = reactive({
    protocol: apiConfig.protocol,
    host: apiConfig.host,
    port: apiConfig.port
});

// Estado inicial para reset
const initialConfig = {
    protocol: 'http',
    host: '127.0.0.1',
    port: 3000
};

// Estado de conexión
const connectionStatus = reactive({
    class: 'unknown',
    text: 'No probado'
});

const openConfigModal = () => {
    // Cargar valores actuales al abrir
    loadCurrentConfig();
    configModal.value?.show();
}

const closeConfigModal = () => {
    console.log("closeConfigModal");
    configModal.value?.hide();
}

const loadCurrentConfig = () => {
    localConfig.protocol = apiConfig.protocol;
    localConfig.host = apiConfig.host;
    localConfig.port = apiConfig.port;
}

const getPreviewUrl = () => {
    return `${localConfig.protocol}://${localConfig.host}:${localConfig.port}`;
}

const saveConfig = () => {
    try {
        // Actualizar la configuración global (automáticamente guarda en localStorage)
        apiConfig.update({
            protocol: localConfig.protocol,
            host: localConfig.host,
            port: localConfig.port
        });
        
        console.log('Configuración guardada:', apiConfig.getFullUrl());
        
        // Actualizar estado de conexión
        connectionStatus.class = 'unknown';
        connectionStatus.text = 'Configuración guardada - Probar conexión';
        
        closeConfigModal();
        
        // Opcional: mostrar mensaje de éxito
        // toast.success('Configuración guardada correctamente');
        
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        // toast.error('Error al guardar la configuración');
    }
}

const resetConfig = () => {
    localConfig.protocol = initialConfig.protocol as 'http' | 'https';
    localConfig.host = initialConfig.host;
    localConfig.port = initialConfig.port;
    
    // Limpiar estado de conexión
    connectionStatus.class = 'unknown';
    connectionStatus.text = 'No probado';
}

const reloadFromStorage = () => {
    // Recargar desde localStorage
    loadCurrentConfig();
    
    // Limpiar estado de conexión
    connectionStatus.class = 'unknown';
    connectionStatus.text = 'Configuración recargada';
    
    console.log('Configuración recargada desde localStorage');
}

onMounted(() => {
    // Cargar configuración actual al montar el componente
    loadCurrentConfig();
    const configTrigger = document.querySelector('#ConfigTrigger') as HTMLButtonElement;
    configTrigger?.addEventListener('click', () => {
        openConfigModal();
    })
    // Opcional: abrir modal automáticamente
    // configModal.value?.show();
});

// Exponer métodos para uso externo
defineExpose({
    openConfigModal
});
</script>

<style scoped>
.config-modal {
    background-color: #000000;
    color: #fff;
    padding: 24px;
    width: 100%;
}

.config-modal h2 {
    margin: 0 0 24px 0;
    color: #cccccc;
    font-size: 24px;
    font-weight: 600;
}

.config-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: #555;
    font-size: 14px;
}

.form-group input,
.form-group select {
    padding: 12px;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #007bff;
    background-color: black;
    color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.readonly-input {
    cursor: not-allowed;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-indicator.unknown {
    background-color: #6c757d;
}

.status-indicator.testing {
    background-color: #ffc107;
    animation: pulse 1.5s infinite;
}

.status-indicator.success {
    background-color: #28a745;
}

.status-indicator.error {
    background-color: #dc3545;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.btn-test:hover:not(:disabled) {
    background-color: #138496;
}

.btn-test:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-info {
    background-color: #17a2b8;
    color: white;
}

.btn-info:hover {
    background-color: #138496;
}

.button-group {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #333;
}

.btn-cancel {
    background-color: #dc3545;
    color: white;
}

.btn-cancel:hover {
    background-color: #c82333;
}

/* Responsive */
@media (max-width: 600px) {
    .config-modal {
        padding: 16px;
    }
    
    .button-group {
        flex-direction: column;
    }
}
</style>