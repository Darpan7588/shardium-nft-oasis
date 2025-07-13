import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const WalletConnection = () => {
  const { address, isConnected, isConnecting, balance, chainId, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://explorer-sphinx.shardeum.org/address/${address}`, '_blank');
    }
  };

  const isCorrectNetwork = chainId === '0x1F92'; // Shardeum testnet

  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-white font-medium"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{formatAddress(address!)}</span>
              {balance && (
                <span className="text-xs text-muted-foreground">
                  {parseFloat(balance).toFixed(4)} SHM
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-sm border-primary/20">
        <div className="p-3 border-b border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Wallet Address</span>
            {!isCorrectNetwork && (
              <Badge variant="destructive" className="text-xs">
                Wrong Network
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <code className="text-xs bg-primary/10 px-2 py-1 rounded">
              {formatAddress(address!)}
            </code>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={copyAddress}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          {balance && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">Balance: </span>
              <span className="text-sm font-medium text-accent">
                {parseFloat(balance).toFixed(6)} SHM
              </span>
            </div>
          )}
        </div>
        
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnectWallet} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};