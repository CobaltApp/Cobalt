import assert from 'assert';
import { MultisigHDWallet } from '../../src/class';
import * as BlueElectrum from '../../src/custom-modules/BlueElectrum';

jest.setTimeout(300 * 1000);

afterAll(() => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  try {
    await BlueElectrum.connectMain();
  } catch (Err) {
    console.log('failed to connect to Electrum:', Err);
    process.exit(2);
  }
});

describe('multisig-hd-wallet', () => {
  it('can fetch balance & transactions', async () => {
    const path = "m/48'/0'/0'/2'";
    const fp1 = 'D37EAD88';
    const fp2 = '168DD603';
    const Zpub1 = 'Zpub74ijpfhERJNjhCKXRspTdLJV5eoEmSRZdHqDvp9kVtdVEyiXk7pXxRbfZzQvsDFpfDHEHVtVpx4Dz9DGUWGn2Xk5zG5u45QTMsYS2vjohNQ';
    const Zpub2 = 'Zpub75mAE8EjyxSzoyPmGnd5E6MyD7ALGNndruWv52xpzimZQKukwvEfXTHqmH8nbbc6ccP5t2aM3mws3pKYSnKpKMMytdbNEZFUxKzztYFM8Pn';

    const w = new MultisigHDWallet();
    w.addCosigner(Zpub1, fp1);
    w.addCosigner(Zpub2, fp2);
    w.setDerivationPath(path);
    w.setM(2);

    assert.strictEqual(w.getM(), 2);
    assert.strictEqual(w.getN(), 2);
    assert.strictEqual(w.getDerivationPath(), path);
    assert.strictEqual(w.getCosigner(1), Zpub1);
    assert.strictEqual(w.getCosigner(2), Zpub2);
    assert.strictEqual(w.getCosignerForFingerprint(fp1), Zpub1);
    assert.strictEqual(w.getCosignerForFingerprint(fp2), Zpub2);

    await w.fetchBalance();
    await w.fetchTransactions();
    assert.ok(w.getTransactions().length >= 6);
  });
});
