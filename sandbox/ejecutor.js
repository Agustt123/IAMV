import { NodeVM } from 'vm2';

export const ejecutarCodigo = async (code, context = {}) => {
    const vm = new NodeVM({
        console: 'inherit', // <--- así ves los logs del código ejecutado
        sandbox: context,
        timeout: 5000,
        require: { external: false },
    });

    try {
        const result = await vm.run(`(async () => { ${code} })()`);
        return result;
    } catch (error) {
        console.error('🧨 Error dentro del sandbox:', error);
        // Esto te mostrará la excepción completa (stack + tipo)
        throw new Error(
            `Error al ejecutar código: ${error?.message || JSON.stringify(error)}`
        );
    }
};
