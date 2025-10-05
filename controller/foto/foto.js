import fs from 'fs/promises';
import path from 'path';


let busRef = null;
export const initFotoController = (bus) => { busRef = bus; };


/**
* Dispara la captura en el agente vía WS y opcionalmente guarda el resultado.
* @param {Object} opts
* @param {('rear'|'front')} [opts.camera='rear']
* @param {boolean} [opts.inline=true] - Si true, el agente devuelve data_b64 en el ACK.
* @param {number} [opts.timeoutMs] - Override de timeout para esta operación.
* @returns {Promise<{ok:boolean, photoId?:string, url?:string, path?:string, raw:any}>}
*/
export async function tomarFoto(opts = {}) {
    if (!busRef) throw new Error('bus_not_initialized');


    const {
        camera = 'rear',
        inline = true,
        timeoutMs,
    } = opts;


    // Enviamos comando al agente (misma idea que torch/mensaje)
    const res = await busRef.sendCommand('photo', { camera, inline }, { timeoutMs });


    const ok = res?.ok === true || String(res?.ok).toLowerCase() === 'true';
    if (!ok) {
        return { ok: false, raw: res };
    }


    // Si el agente devolvió la imagen inline (base64), podemos guardarla.
    const b64 = res?.data_b64;
    const mime = res?.mime || 'image/jpeg';
    const photoId = res?.photoId || `ph_${Date.now()}`;


    // Config opcional por ENV para persistir archivo
    const SAVE_DIR = process.env.SAVE_DIR || null; // ej: './uploads'
    const PUBLIC_BASE = process.env.PUBLIC_BASE || null; // ej: 'https://node2.liit.com.ar/uploads'


    if (b64 && SAVE_DIR) {
        const ext = mime.includes('png') ? 'png' : 'jpg';
        const fileName = `${photoId}.${ext}`;
        const absDir = path.resolve(SAVE_DIR);
        await fs.mkdir(absDir, { recursive: true });
        const absPath = path.join(absDir, fileName);


        const buf = Buffer.from(b64, 'base64');
        await fs.writeFile(absPath, buf);


        const url = PUBLIC_BASE ? `${PUBLIC_BASE}/${fileName}` : undefined;


        return { ok: true, photoId, path: absPath, url, raw: res };
    }


    // Si no hay persistencia, devolvemos el ACK tal cual
    return { ok: true, photoId, raw: res };
}