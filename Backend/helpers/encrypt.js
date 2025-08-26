const Config = require('../config/config');
const crypto = require('crypto');
const cnf = new Config();

module.exports = class Encriptar {
  constructor(cadena, cadenaEncriptada) {
    this.cadena = cadena;
    this.cadenaEncriptada = cadenaEncriptada;
    this.algoritmo = 'aes-128-gcm';

    // Constantes de longitudes
    this.KEY_LENGTH = 16;        // 16 bytes para clave AES-128
    this.IV_LENGTH = 12;         // 12 bytes para IV GCM
    this.AUTH_TAG_LENGTH = 16;   // 16 bytes de auth tag GCM


    // 1) Derivar clave: SHA-256 → 32 bytes → truncar a 16 bytes
    const fullKey = crypto
      .createHash('sha256')
      .update(cnf.llaveCif, 'utf8')
      .digest();
    this.key = fullKey.slice(0, this.KEY_LENGTH);

    // 2) Cargar IV en Base64 y truncar a 12 bytes
    const ivBuffer = Buffer.from(cnf.ivCif, 'base64');
    this.iv = ivBuffer.slice(0, this.IV_LENGTH);
  }

  encrypt() {


    try {
      const cipher = crypto.createCipheriv(this.algoritmo, this.key, this.iv);
      const encrypted = Buffer.concat([
        cipher.update(this.cadena, 'utf8'),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag(); // 16 bytes

      // Concatenar texto cifrado + authTag y codificar en Base64
      return Buffer.concat([encrypted, authTag]).toString('base64');
    } catch (err) {
      console.error('Error en cifrado:', err.message);
      return '';
    }
  }

  decrypt() {
    try {
      const data = Buffer.from(this.cadenaEncriptada, 'base64');
      // Separar authTag (últimos 16 bytes) y el texto cifrado
      const authTag = data.slice(data.length - this.AUTH_TAG_LENGTH);
      const encryptedText = data.slice(0, data.length - this.AUTH_TAG_LENGTH);

      const decipher = crypto.createDecipheriv(this.algoritmo, this.key, this.iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final()
      ]);
      console.log("Cif ", decrypted.toString('utf8'));      
      return decrypted.toString('utf8');
    } catch (err) {
      console.error('Error al desencriptar:', err.message);
      return '';
    }
  }
};