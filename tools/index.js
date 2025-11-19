export const createTools = (bus) => ({
    // 🔦 Linterna
    encenderLinterna: async ({ to }) => {
        return await bus.send('linterna', { to, action: 'on' });
    },
    apagarLinterna: async ({ to }) => {
        return await bus.send('linterna', { to, action: 'off' });
    },

    // 💬 Mensajes
    enviarMensajeWS: async ({ to, mensaje }) => {
        return await bus.send('mensaje', { to, mensaje });
    },

    // 🔊 Sonido
    reproducirSonido: async ({ to, sonido }) => {
        return await bus.send('sonido', { to, sonido });
    },

    // 📸 Foto
    tomarFoto: async ({ to }) => {
        return await bus.send('foto', { to });
    },

    // 🗺️ Ubicación
    obtenerUbicacion: async ({ to }) => {
        return await bus.send('ubicacion', { to });
    },

    // ☎️ Llamada
    hacerLlamada: async ({ to }) => {
        return await bus.send('llamada', { to });
    },

    // 💬 WhatsApp
    enviarWhatsApp: async ({ to, text }) => {
        return await bus.send('wa', { to, text });
    },
    enviarUbicacion: async ({ latitud, longitud }) => {
        return await enviarUbicacion({ latitud, longitud });
    },
});

export let tools = null;
export const initTools = (bus) => {
    tools = createTools(bus);
    return tools;
};
