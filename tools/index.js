export const createTools = (bus) => ({
    enviarMensajeWS: async ({ to, mensaje }) => {
        return await bus.send('mensaje', { to, mensaje });
    },
    encenderLinterna: async ({ to }) => {
        return await bus.send('linterna', { to, action: 'on' });
    },
    reproducirSonido: async ({ to, sonido }) => {
        return await bus.send('sonido', { to, sonido });
    },
    tomarFoto: async ({ to }) => {
        return await bus.send('foto', { to });
    },
    // Puedes seguir añadiendo herramientas de tus controladores actuales
});

export let tools = null;
export const initTools = (bus) => {
    tools = createTools(bus);
    return tools;
};
