'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingCardProps {
    title: string;
    price: number;
    credits: number;
    features: string[];
    isPopular?: boolean;
    onBuy: () => void;
    loading?: boolean;
}

export function PricingCard({
    title,
    price,
    credits,
    features,
    isPopular = false,
    onBuy,
    loading = false,
}: PricingCardProps) {
    return (
        <div className="relative group">
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-4 py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                    </Badge>
                </div>
            )}

            {/* Card */}
            <div
                className={`
          relative overflow-hidden rounded-2xl p-8
          bg-card
          border transition-all duration-300
          hover:scale-105 hover:shadow-lg
          ${isPopular
                        ? 'border-primary shadow-md shadow-primary/10'
                        : 'border-border hover:border-primary/50'
                    }
        `}
            >
                {/* Background Gradient */}
                {isPopular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent blur-xl" />
                )}

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-foreground">
                                ${price}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            {credits} Assessment Credits
                        </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-3 text-foreground/80">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Buy Button */}
                    <Button
                        onClick={onBuy}
                        disabled={loading}
                        variant={isPopular ? "default" : "secondary"}
                        className="w-full py-6 text-base font-semibold transition-all duration-300"
                    >
                        {loading ? 'Processing...' : 'Buy Now'}
                    </Button>
                </div>

                {/* Decorative Corner */}
                {isPopular && (
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
                )}
            </div>
        </div>
    );
}
