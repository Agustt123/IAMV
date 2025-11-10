import { NodeVM } from 'vm2';

export const ejecutarCodigo = async (code, context = {}) => {
    const vm = new NodeVM({
        console: 'redirect',
        sandbox: context,
        timeout: 5000,
        require: {
            external: false,
            builtin: [],
        },
    });

    try {
        const result = await vm.run(`(async () => { ${code} })()`);
        return result;
    } catch (error) {
        throw new Error(`Error al ejecutar código: ${error.message}`);
    }
};
