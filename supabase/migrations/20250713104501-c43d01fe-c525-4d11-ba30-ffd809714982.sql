-- Create tables for NFT marketplace
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(20, 8), -- SHM price
  creator_id UUID REFERENCES public.users(id),
  owner_id UUID REFERENCES public.users(id),
  is_listed BOOLEAN DEFAULT false,
  category TEXT,
  attributes JSONB,
  metadata_uri TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_address, token_id)
);

CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID REFERENCES public.nfts(id),
  from_user_id UUID REFERENCES public.users(id),
  to_user_id UUID REFERENCES public.users(id),
  transaction_hash TEXT UNIQUE NOT NULL,
  transaction_type TEXT NOT NULL, -- 'mint', 'transfer', 'sale'
  price DECIMAL(20, 8), -- SHM amount
  gas_fee DECIMAL(20, 8),
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Create policies for NFTs table
CREATE POLICY "NFTs are viewable by everyone" 
ON public.nfts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create NFTs" 
ON public.nfts 
FOR INSERT 
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Owners can update their NFTs" 
ON public.nfts 
FOR UPDATE 
USING (owner_id = auth.uid() OR creator_id = auth.uid());

-- Create policies for transactions table
CREATE POLICY "Transactions are viewable by everyone" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_nfts_owner_id ON public.nfts(owner_id);
CREATE INDEX idx_nfts_creator_id ON public.nfts(creator_id);
CREATE INDEX idx_nfts_is_listed ON public.nfts(is_listed);
CREATE INDEX idx_transactions_nft_id ON public.transactions(nft_id);
CREATE INDEX idx_transactions_hash ON public.transactions(transaction_hash);
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nfts_updated_at
  BEFORE UPDATE ON public.nfts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();