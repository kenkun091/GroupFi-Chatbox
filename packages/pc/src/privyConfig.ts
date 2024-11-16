// pnpm install @privy-io/react-auth

import type {PrivyClientConfig} from '@privy-io/react-auth';


export const privyConfig: PrivyClientConfig = {

  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  loginMethods: ['wallet', 'email'],
  appearance: {
    walletList: ['metamask', 'rainbow'],
    showWalletLoginFirst: true,
  },
};