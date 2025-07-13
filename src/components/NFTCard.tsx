import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface NFTCardProps {
  id: string;
  title: string;
  artist: string;
  price: string;
  image: string;
  likes?: number;
  views?: number;
}

const NFTCard = ({ id, title, artist, price, image, likes = 0, views = 0 }: NFTCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className="group bg-nft-card border-border hover:bg-nft-card-hover hover:border-primary/30 transition-all duration-300 hover:shadow-card overflow-hidden">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-background/20 backdrop-blur-sm hover:bg-primary/20"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
          </Button>
        </div>

        {/* View Count */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="secondary" className="bg-background/20 backdrop-blur-sm text-foreground border-none">
            <Eye className="h-3 w-3 mr-1" />
            {views}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm">by {artist}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="text-lg font-bold text-price-highlight">
                {price} SHM
              </p>
            </div>
            <Button variant="gradient" size="sm" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Buy Now
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {likes} likes
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {views} views
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTCard;