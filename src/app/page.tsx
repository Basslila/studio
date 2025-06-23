import { SrtConverter } from '@/components/srt-converter';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
             <Sparkles className="h-8 w-8 text-primary" />
             <h1 className="text-4xl sm:text-5xl font-headline font-bold tracking-tight text-foreground">
              Lipika SRT
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-body">
            Instantly convert your Hindi SRT subtitle files to Hinglish using the power of AI.
          </p>
        </div>
        <SrtConverter />
      </div>
    </main>
  );
}
