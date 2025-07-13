import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHARDEUM_TESTNET_RPC = 'https://api-testnet.shardeum.org';

interface ShardeumTransaction {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed?: string;
  status?: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log('Shardeum API request:', { action, params });

    switch (action) {
      case 'getBalance':
        return await getBalance(params.address);
      
      case 'getTransaction':
        return await getTransaction(params.hash);
      
      case 'sendTransaction':
        return await sendTransaction(params);
      
      case 'getContractData':
        return await getContractData(params.contractAddress, params.method, params.params);
      
      case 'verifyTransaction':
        return await verifyTransaction(params.hash);
      
      case 'getNFTMetadata':
        return await getNFTMetadata(params.tokenURI);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error: any) {
    console.error('Shardeum API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

async function makeRPCCall(method: string, params: any[] = []): Promise<any> {
  const response = await fetch(SHARDEUM_TESTNET_RPC, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.result;
}

async function getBalance(address: string): Promise<Response> {
  try {
    const balance = await makeRPCCall('eth_getBalance', [address, 'latest']);
    const balanceInSHM = parseInt(balance, 16) / Math.pow(10, 18);
    
    return new Response(
      JSON.stringify({ balance: balanceInSHM.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getTransaction(hash: string): Promise<Response> {
  try {
    const transaction = await makeRPCCall('eth_getTransactionByHash', [hash]);
    const receipt = await makeRPCCall('eth_getTransactionReceipt', [hash]);
    
    return new Response(
      JSON.stringify({ transaction, receipt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendTransaction(params: any): Promise<Response> {
  try {
    // This would typically be called from the frontend with signed transaction
    const txHash = await makeRPCCall('eth_sendRawTransaction', [params.signedTransaction]);
    
    return new Response(
      JSON.stringify({ transactionHash: txHash }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getContractData(contractAddress: string, method: string, params: any[] = []): Promise<Response> {
  try {
    // Encode function call data (simplified - in production, use proper ABI encoding)
    const data = await makeRPCCall('eth_call', [{
      to: contractAddress,
      data: method, // This should be properly encoded function signature + params
    }, 'latest']);
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function verifyTransaction(hash: string): Promise<Response> {
  try {
    const receipt = await makeRPCCall('eth_getTransactionReceipt', [hash]);
    
    if (!receipt) {
      return new Response(
        JSON.stringify({ verified: false, status: 'pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isSuccessful = receipt.status === '0x1';
    
    // Update transaction in database
    const { error } = await supabase
      .from('transactions')
      .update({
        status: isSuccessful ? 'confirmed' : 'failed',
        block_number: parseInt(receipt.blockNumber, 16),
        gas_fee: (parseInt(receipt.gasUsed, 16) * parseInt(receipt.effectiveGasPrice || '0', 16)) / Math.pow(10, 18),
      })
      .eq('transaction_hash', hash);
    
    if (error) {
      console.error('Failed to update transaction:', error);
    }
    
    return new Response(
      JSON.stringify({ 
        verified: true, 
        status: isSuccessful ? 'confirmed' : 'failed',
        receipt 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getNFTMetadata(tokenURI: string): Promise<Response> {
  try {
    // Handle IPFS URLs
    let url = tokenURI;
    if (url.startsWith('ipfs://')) {
      url = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    const response = await fetch(url);
    const metadata: NFTMetadata = await response.json();
    
    return new Response(
      JSON.stringify({ metadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(handler);