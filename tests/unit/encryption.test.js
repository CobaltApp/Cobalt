const assert = require('assert');
const c = require('../../src/custom-modules/encryption');

describe('unit - encryption', function () {
  it('encrypts and decrypts', function () {
    const data2encrypt = 'really long data string bla bla really long data string bla bla really long data string bla bla';
    const crypted = c.encrypt(data2encrypt, 'password');
    const decrypted = c.decrypt(crypted, 'password');

    assert.ok(crypted);
    assert.ok(decrypted);
    assert.strictEqual(decrypted, data2encrypt);
    assert.ok(crypted !== data2encrypt);

    let decryptedWithBadPassword;
    try {
      decryptedWithBadPassword = c.decrypt(crypted, 'passwordBad');
    } catch (e) {}
    assert.ok(!decryptedWithBadPassword);

    let exceptionRaised = false;
    try {
      c.encrypt('yolo', 'password');
    } catch (_) {
      exceptionRaised = true;
    }
    assert.ok(exceptionRaised);
  });

  it('handles ok malformed data', function () {
    const decrypted = c.decrypt(
      'U2FsdGVkX1/OSNdi0JrLANn9qdNEiXgP20MJgT13CMKC7xKe+sb7x0An6r8lzrYeL2vjoPm2Xi5I3UdBcsgjgh0TR4PypNdDaW1tW8LhFH1wVCh1hacrFsJjoKMBmdCn4IVMwtIffGPptqBrGZl+6kjOc3BBbgq4uaAavFIwTS86WdaRt9qAboBcoPJZxsj37othbZfZfl2GBTCWnR1tOYAbElKWv4lBwNQpX7HqX3wTQkAbamBslsH5FfZRY1c38lOHrZMwNSyxhgspydksTxKkhPqWQu3XWT4GpRoRuVvYlBNvJOCUu2JbiVSp4NiOMSfnA8ahvpCGRNy+qPWsXqmJtz9BwyzedzDkgg6QOqxXz4oOeEJa/XLKiuv3ItsLrZb+sSA6wjB1Cx6/Oh2vW7eiHjCITeC7KUK1fAxVwufLcprNkvG8qFzkOcHxDyzG+sNL0cMipAxhpMX7qIcYcZFoLYkQRQHpOZKZCIAdNTfPGJ7M4cxGM0V+Uuirjyn+KAPJwNElwmPpX8sTQyEqlIlEwVjFXBpz28N5RAGN2zzCzEjD8NVYQJ2QyHj0gfWe',
      'fakePassword',
    );
    assert.ok(!decrypted);
  });

  it('can decrypt cipher created by CryptoJS@3.1.9-1', () => {
    const data2decrypt = 'really long data string bla bla really long data string bla bla really long data string bla bla';
    const crypted =
      'U2FsdGVkX19fJ4PcLum+tmBpEVNgGGsGKOhRS21cEcYAox+Df8VqmnnG9t2PvpM05eWImCRArorVUUegtcfSq314WMFzxKmiPIl9eqV1aOY+VFGuIBx0VIVsCWix2Q7sRZZwnOVpG5bdveZI0+Azyw==';
    const decrypted = c.decrypt(crypted, 'password');
    assert.deepEqual(data2decrypt, decrypted);
  });
});
