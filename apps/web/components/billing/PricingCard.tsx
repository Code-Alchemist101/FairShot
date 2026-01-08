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
          bg-slate-800/50 backdrop-blur-sm
          border transition-all duration-300
          hover:scale-105 hover:shadow-2xl
          ${isPopular
                        ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20 hover:border-cyan-400 hover:shadow-cyan-500/30'
                        : 'border-slate-700 hover:border-slate-600'
                    }
        `}
            >
                {/* Background Gradient */}
                {isPopular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 blur-xl" />
                )}

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                ${price}
                            </span>
                        </div>
                        <p className="text-slate-400 mt-2">
                            {credits} Assessment Credits
                        </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-3 text-slate-300">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-cyan-400" />
                                </div>
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Buy Button */}
                    <Button
                        onClick={onBuy}
                        disabled={loading}
                        className={`
              w-full py-6 text-base font-semibold
              transition-all duration-300
              ${isPopular
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }
            `}
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
