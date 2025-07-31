"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { InnerBeingLogo } from "@/components/icons/innerbeing-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LandingPageProps {
  onStartTest: () => void;
  onGoBack: () => void;
}

export function InnerBeingLandingPage({ onStartTest, onGoBack }: LandingPageProps) {
  const estimatedTime = 12 + 10 + 10 + 10 + 12 + 15; // Sum of all assessment times
  const landingImage = "https://placehold.co/800x800.png";
  const [isImageLoading, setIsImageLoading] = useState(false); // Set to false as it's now static

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 -m-12">
       <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
       <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-start max-w-6xl mx-auto">
        
        <div className="md:order-2 flex justify-center">
            <Card className="shadow-glow-purple w-full max-w-sm aspect-[3/4] overflow-hidden relative">
                {isImageLoading ? (
                    <Skeleton className="w-full h-full bg-muted" />
                ) : (
                    landingImage && <Image src={landingImage} alt="Visual representation of the inner quest" layout="fill" className="object-cover animate-ken-burns" data-ai-hint="fantasy journey" />
                )}
            </Card>
        </div>

        <div className="md:order-1 flex flex-col items-center md:items-start text-center md:text-left animate-fade-in-up">
            <div className="bg-card/80 p-6 rounded-2xl shadow-lg mb-8">
              <div className="flex items-center gap-4">
                  <InnerBeingLogo className="w-16 h-16 text-primary" />
                  <div>
                      <h1 className="font-headline text-5xl font-bold text-primary">
                          InnerBeing
                      </h1>
                      <p className="text-xl text-muted-foreground mt-1">
                          The Quest to find inner self
                      </p>
                  </div>
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-semibold mt-4 max-w-lg">
                Are you ready for the self-awareness adventure?
            </h2>

            <div className="mt-8 flex items-center justify-center gap-4 text-lg bg-card/50 p-4 rounded-lg">
                <Clock className="w-8 h-8 text-primary" />
                <span>Estimated time to complete: <b>{estimatedTime} minutes</b></span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
              <Button
                  onClick={onGoBack}
                  size="lg"
                  variant="outline"
                  className="text-lg"
              >
                  <ArrowLeft className="mr-2" /> Go Back
              </Button>
              <Button
                  onClick={onStartTest}
                  size="lg"
                  className="text-lg"
              >
                  Start Your Quest <ArrowRight className="ml-2" />
              </Button>
            </div>
        </div>

      </div>
    </div>
  );
}
