const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.AES_SECRET_KEY;

/**
 * Encrypt a string value using AES
 */
const encrypt = (value) => {
  if (!value || !SECRET_KEY) return value;
  return CryptoJS.AES.encrypt(String(value), SECRET_KEY).toString();
};

/**
 * Decrypt an AES-encrypted string
 */
const decrypt = (encryptedValue) => {
  if (!encryptedValue || !SECRET_KEY) return encryptedValue;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return encryptedValue;
  }
};

/**
 * Encrypt specific fields in an object
 */
const encryptFields = (obj, fields) => {
  const result = { ...obj };
  fields.forEach((field) => {
    if (result[field] !== undefined) {
      result[field] = encrypt(result[field]);
    }
  });
  return result;
};

/**
 * Decrypt specific fields in an object
 */
const decryptFields = (obj, fields) => {
  const result = { ...obj };
  fields.forEach((field) => {
    if (result[field] !== undefined) {
      result[field] = decrypt(result[field]);
    }
  });
  return result;
};

module.exports = { encrypt, decrypt, encryptFields, decryptFields };
