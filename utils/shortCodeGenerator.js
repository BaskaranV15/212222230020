async function generateShortCode() {
  const { customAlphabet } = await import('nanoid');
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
  return nanoid();
}

module.exports = generateShortCode;


