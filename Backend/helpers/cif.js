const Config = require('../config/config');
const crypto = require('crypto');
const cnf = new Config();


module.exports = class Encriptar {
  constructor(cadena, cadenaEncriptada) {
    this.cadena = cadena;
    this.cadenaEncriptada = cadenaEncriptada;
    this.algoritmo = 'aes-128-gcm';
    this.llave = cnf.llaveCif;
    this.iv = cnf.ivCif;
  
  } 

  //crear un has del cif encriptado
  deriveKey(clave) {
    const hash = crypto.createHash('sha256')
                     .update(clave, 'utf8')
                     .digest();
    return hash.slice(0, 16);
  }

  //Convertir el iv a array de bytes
  getIV(ivBase64) {
    let iv = Buffer.from(ivBase64, 'base64');
    if (iv.length > 12) {
      iv = iv.slice(0, 12);
    }
    return iv;
  }


  encodeUrlSafe(plain) {
    const b64 = Buffer.from(plain, 'utf8').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

//Encriptar el cif
  encrypt() {
    console.log("texto ", this.cadena);
    console.log("llave iv ", this.iv);
    console.log("llave ", this.llave);

    const key = this.deriveKey(this.llave);
    const iv = this.getIV(this.iv);

    const cipher = crypto.createCipheriv('aes-128-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(this.cadena, 'utf8'),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    // concatenamos ciphertext + tag
    const encryptedBytes = Buffer.concat([encrypted, tag]);
    // primera capa de Base64
    const base64Enc = encryptedBytes.toString('base64');
    // segunda capa: URL-safe Base64 del string anterior
    return this.encodeUrlSafe(base64Enc);
  }


  //Desencriptar el cif
  decrypt() {
    const key = this.deriveKey(this.llave);
    const iv = this.getIV(this.iv);

    // Revertir URL-safe → Base64 normal (padding incluido)
    let b64 = this.cadenaEncriptada.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';

    // esa es la Base64 del ciphertext real
    const innerBase64 = Buffer.from(b64, 'base64').toString('utf8');

    // De Base64 → Buffer(ciphertext + tag)
    const encryptedBytes = Buffer.from(innerBase64, 'base64');
    const ciphertext = encryptedBytes.slice(0, -16);
    const tag = encryptedBytes.slice(-16);

    const decipher = crypto.createDecipheriv('aes-128-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    console.log("CIF desencriptado  ", decrypted.toString('utf8'));
    return decrypted.toString('utf8');
  }

}



