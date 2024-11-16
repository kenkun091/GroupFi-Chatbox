// pnpm install @privy-io/wagmi

import {mainnet, sepolia, polygon, base} from 'viem/chains';
import {http} from 'wagmi';

import {createConfig} from '@privy-io/wagmi';
import {connectorsForWallets} from '@rainbow-me/rainbowkit';
import {toPrivyWallet} from '@privy-io/cross-app-connect/rainbow-kit';

const connectors = connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: [
          toPrivyWallet({
            id: 'cm3i5sgth034ft6mzekwo3qkq',
            name: 'Privy wallet demo',
            iconUrl: '',
          }),
        ],
      },
    ],
    {
      appName: 'Privy',
      projectId: 'Demo',
    },
  );

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, polygon, base],
//   multiInjectedProviderDiscovery: true,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [base.id]: http()
  },
  ssr: true
});