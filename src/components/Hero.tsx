import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  const stats = [
    { label: "NFTs Listed", value: "10K+", icon: TrendingUp },
    { label: "Artists", value: "2.5K+", icon: Sparkles },
    { label: "Volume Traded", value: "50M+ SHM", icon: Zap },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/95 z-10" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-30 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by Shardeum Network
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Discover & Trade
            </span>
            <br />
            <span className="text-foreground">
              Extraordinary NFTs
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The premier NFT marketplace built on Shardeum. Collect, trade, and create unique digital assets with zero gas fees.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="gradient" size="lg" className="text-lg px-8 py-4 h-auto">
              <Sparkles className="h-5 w-5 mr-2" />
              Explore Collections
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-primary/30 hover:border-primary">
              <Shield className="h-5 w-5 mr-2" />
              Create NFT
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/30">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;