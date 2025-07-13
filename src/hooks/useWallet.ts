import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  chainId: string | null;
}

interface ShardeumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isShardeum?: boolean;
}

declare global {
  interface Window {
    ethereum?: ShardeumProvider;
    shardeum?: ShardeumProvider;
  }
}

const SHARDEUM_TESTNET_CONFIG = {
  chainId: '0x1F92', // 8082 in hex
  chainName: 'Shardeum Sphinx Testnet',
  nativeCurrency: {
    name: 'Shardeum',
    symbol: 'SHM',
    decimals: 18,
  },
  rpcUrls: ['https://api-testnet.shardeum.org'],
  blockExplorerUrls: ['https://explorer-sphinx.shardeum.org'],
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    balance: null,
    chainId: null,
  });

  const getProvider = useCallback((): ShardeumProvider | null => {
    if (typeof window === 'undefined') return null;
    
    // Check for Shardeum-specific provider first
    if (window.shardeum) {
      return window.shardeum;
    }
    
    // Fallback to MetaMask or other Ethereum providers
    if (window.ethereum) {
      return window.ethereum;
    }
    
    return null;
  }, []);

  const switchToShardeum = async (): Promise<boolean> => {
    const provider = getProvider();
    if (!provider) return false;

    try {
      // Try to switch to Shardeum testnet
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SHARDEUM_TESTNET_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [SHARDEUM_TESTNET_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Shardeum network:', addError);
          toast.error('Failed to add Shardeum network');
          return false;
        }
      } else {
        console.error('Failed to switch to Shardeum network:', switchError);
        toast.error('Failed to switch to Shardeum network');
        return false;
      }
    }
  };

  const getBalance = async (address: string): Promise<string> => {
    const provider = getProvider();
    if (!provider) return '0';

    try {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from wei to SHM
      const balanceInSHM = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInSHM.toFixed(6);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  };

  const connectWallet = async () => {
    const provider = getProvider();
    
    if (!provider) {
      toast.error('Please install MetaMask or a Shardeum-compatible wallet');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      const address = accounts[0];

      // Switch to Shardeum testnet
      const switchedSuccessfully = await switchToShardeum();
      if (!switchedSuccessfully) {
        setWallet(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      // Get chain ID
      const chainId = await provider.request({
        method: 'eth_chainId',
      });

      // Get balance
      const balance = await getBalance(address);

      // Save user to database
      const { error } = await supabase
        .from('users')
        .upsert({
          wallet_address: address.toLowerCase(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'wallet_address'
        });

      if (error) {
        console.error('Failed to save user:', error);
      }

      setWallet({
        address,
        isConnected: true,
        isConnecting: false,
        balance,
        chainId,
      });

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      balance: null,
      chainId: null,
    });
    toast.success('Wallet disconnected');
  };

  const checkConnection = async () => {
    const provider = getProvider();
    if (!provider) return;

    try {
      const accounts = await provider.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        const chainId = await provider.request({
          method: 'eth_chainId',
        });
        const balance = await getBalance(address);

        setWallet({
          address,
          isConnected: true,
          isConnecting: false,
          balance,
          chainId,
        });
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  useEffect(() => {
    checkConnection();

    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        checkConnection();
      }
    };

    const handleChainChanged = () => {
      checkConnection();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    switchToShardeum,
    getBalance: () => wallet.address ? getBalance(wallet.address) : Promise.resolve('0'),
  };
};