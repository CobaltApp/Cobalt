import { LegacyWallet } from './wallets/legacy-wallet';
import { HDSegwitP2SHWallet } from './wallets/hd-segwit-p2sh-wallet';
import { LightningCustodianWallet } from './wallets/lightning-custodian-wallet';
import { HDLegacyBreadwalletWallet } from './wallets/hd-legacy-breadwallet-wallet';
import { HDLegacyP2PKHWallet } from './wallets/hd-legacy-p2pkh-wallet';
import { WatchOnlyWallet } from './wallets/watch-only-wallet';
import { HDSegwitBech32Wallet } from './wallets/hd-segwit-bech32-wallet';
import { SegwitBech32Wallet } from './wallets/segwit-bech32-wallet';
import { HDLegacyElectrumSeedP2PKHWallet } from './wallets/hd-legacy-electrum-seed-p2pkh-wallet';
import { HDSegwitElectrumSeedP2WPKHWallet } from './wallets/hd-segwit-electrum-seed-p2wpkh-wallet';
import { MultisigHDWallet } from './wallets/multisig-hd-wallet';
import { HDAezeedWallet } from './wallets/hd-aezeed-wallet';
import { LightningLdkWallet } from './wallets/lightning-ldk-wallet';
import { SLIP39LegacyP2PKHWallet, SLIP39SegwitP2SHWallet, SLIP39SegwitBech32Wallet } from './wallets/slip39-wallets';
import { useTheme } from '@react-navigation/native';

export default class WalletGradient {
  static watchonly = '#353945';
  static legacy = '#58BD7D';
  static multisig = '#9757D7';
  static default = '#3772FF';
  static lightning = '#FFD166';

  static createWallet = () => {
    const { colors } = useTheme();
    return colors.element;
  };

  static gradientsFor(type) {
    const { colors } = useTheme();
    let color;
    switch (type) {
      case WatchOnlyWallet.type:
        color = '#353945';
        break;
      case LegacyWallet.type:
      case HDLegacyP2PKHWallet.type:
      case HDLegacyElectrumSeedP2PKHWallet.type:
      case SLIP39LegacyP2PKHWallet.type:
      case HDLegacyBreadwalletWallet.type:
        color = '#58BD7D';
        break;
      case HDSegwitP2SHWallet.type:
      case SLIP39SegwitP2SHWallet.type:
      case HDSegwitBech32Wallet.type:
      case HDSegwitElectrumSeedP2WPKHWallet.type:
      case SLIP39SegwitBech32Wallet.type:
      case SegwitBech32Wallet.type:
      case HDAezeedWallet.type:
        color = colors.primary;
        break;
      case LightningCustodianWallet.type:
      case LightningLdkWallet.type:
        color = colors.secondary;
        break;
      case MultisigHDWallet.type:
        color = '#9757D7';
        break;
      default:
        color = colors.primary;
        break;
    }
    return color;
  }

  static headerColorFor(type) {
    const { colors } = useTheme();
    let color;
    switch (type) {
      case WatchOnlyWallet.type:
        color = '#353945';
        break;
      case LegacyWallet.type:
      case HDLegacyP2PKHWallet.type:
      case HDLegacyElectrumSeedP2PKHWallet.type:
      case SLIP39LegacyP2PKHWallet.type:
      case HDLegacyBreadwalletWallet.type:
        color = '#58BD7D';
        break;
      case HDSegwitP2SHWallet.type:
      case SLIP39SegwitP2SHWallet.type:
      case HDSegwitBech32Wallet.type:
      case HDSegwitElectrumSeedP2WPKHWallet.type:
      case SLIP39SegwitBech32Wallet.type:
      case SegwitBech32Wallet.type:
      case HDAezeedWallet.type:
        color = colors.primary;
        break;
      case MultisigHDWallet.type:
        color = '#9757D7';
        break;
      case LightningCustodianWallet.type:
      case LightningLdkWallet.type:
        color = colors.secondary;
        break;
      default:
        color = colors.primary;
        break;
    }
    return color;
  }
}
