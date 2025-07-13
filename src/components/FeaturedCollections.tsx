import NFTCard from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Star, ArrowRight } from "lucide-react";
import nft1 from "@/assets/nft-1.jpg";
import nft2 from "@/assets/nft-2.jpg";
import nft3 from "@/assets/nft-3.jpg";
import nft4 from "@/assets/nft-4.jpg";

const FeaturedCollections = () => {
  const featuredNFTs = [
    {
      id: "1",
      title: "Cosmic Dreams #001",
      artist: "DigitalVoid",
      price: "12.5",
      image: nft1,
      likes: 234,
      views: 1420
    },
    {
      id: "2",
      title: "Neon City #047",
      artist: "CyberArtist",
      price: "8.9",
      image: nft2,
      likes: 189,
      views: 892
    },
    {
      id: "3",
      title: "Holographic Form #023",
      artist: "MetaCreator",
      price: "15.2",
      image: nft3,
      likes: 156,
      views: 634
    },
    {
      id: "4",
      title: "Android Dreams #012",
      artist: "FutureVision",
      price: "22.8",
      image: nft4,
      likes: 301,
      views: 1856
    }
  ];

  const categories = [
    { label: "Trending", icon: TrendingUp, count: "1.2K", active: true },
    { label: "Hot", icon: Flame, count: "856" },
    { label: "Top Rated", icon: Star, count: "2.1K" },
  ];

  return (
    <section id="collections" className="py-20 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Flame className="h-4 w-4 mr-2" />
            Featured Collections
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Trending 
            </span>
            <span className="text-foreground"> NFTs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most sought-after digital collectibles on the Shardeum network
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={category.active ? "gradient" : "nft"}
              className="gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
              <Badge 
                variant="secondary" 
                className={`ml-2 ${category.active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}`}
              >
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredNFTs.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:border-primary">
            View All Collections
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Section */}
        <div className="mt-20 p-8 bg-gradient-secondary rounded-2xl border border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50M+</div>
              <div className="text-muted-foreground">SHM Volume</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">10K+</div>
              <div className="text-muted-foreground">NFTs Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">2.5K+</div>
              <div className="text-muted-foreground">Active Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-price-highlight mb-2">95%</div>
              <div className="text-muted-foreground">Happy Collectors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;