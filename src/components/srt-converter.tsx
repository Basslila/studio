"use client";

import * as React from 'react';
import { Download, FileText, Loader2, Upload, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { convertHindiToHinglish } from '@/ai/flows/convert-hindi-to-hinglish';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export function SrtConverter() {
  const [file, setFile] = React.useState<File | null>(null);
  const [hindiContent, setHindiContent] = React.useState<string | null>(null);
  const [hinglishContent, setHinglishContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.srt')) {
      setFile(selectedFile);
      setHinglishContent(null);
      setProgress(0);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHindiContent(e.target?.result as string);
      };
      reader.readAsText(selectedFile, 'UTF-8');
    } else {
      if (selectedFile) { // only show toast if a file was actually selected
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid .srt file.",
          variant: "destructive"
        });
      }
      resetState();
    }
  };

  const handleConvert = async () => {
    if (!hindiContent) {
      toast({ title: "No File Content", description: "Please upload a file first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setHinglishContent(''); // Start with empty string to allow appending
    setProgress(0);
    try {
      const srtBlocks = hindiContent.trim().split(/\n\s*\n/);
      if (srtBlocks.length === 0 || (srtBlocks.length === 1 && !srtBlocks[0])) {
        setHinglishContent('');
        setIsLoading(false);
        return;
      }
      
      const CHUNK_SIZE = 50;
      const chunks: string[] = [];
      for (let i = 0; i < srtBlocks.length; i += CHUNK_SIZE) {
        const chunkBlocks = srtBlocks.slice(i, i + CHUNK_SIZE);
        chunks.push(chunkBlocks.join('\n\n'));
      }

      let finalHinglishContent = '';
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const result = await convertHindiToHinglish({ srtContent: chunk });
        
        if (finalHinglishContent && result.hinglishSrtContent) {
          finalHinglishContent += '\n\n';
        }
        finalHinglishContent += result.hinglishSrtContent;
        
        setHinglishContent(finalHinglishContent);

        const newProgress = ((i + 1) / chunks.length) * 100;
        setProgress(newProgress);
      }
      
      toast({
        title: "Conversion Successful",
        description: "Your Hinglish SRT file is ready for download.",
      });
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({ title: "Conversion Failed", description: "An unexpected error occurred during the conversion process. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!hinglishContent) return;
    const blob = new Blob([hinglishContent], { type: 'text/srt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = file?.name.replace(/\.srt$/i, '') || 'converted';
    a.download = `${originalName}_hinglish.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setFile(null);
    setHindiContent(null);
    setHinglishContent(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full shadow-lg rounded-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Start Conversion</CardTitle>
        <CardDescription className="font-body">Follow these three simple steps to convert your file.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <input
            type="file"
            accept=".srt"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Step 1: Upload */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
              <span className="font-bold text-lg">1</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">Upload File</h3>
              {!file ? (
                <p className="text-sm text-muted-foreground">Select your Hindi .srt file to begin.</p>
              ) : (
                 <div className="mt-2 flex items-center justify-between p-2 rounded-md border bg-secondary/50">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetState}>
                      <X className="h-4 w-4" />
                    </Button>
                 </div>
              )}
            </div>
            {!file && (
              <Button onClick={triggerFileInput} variant="outline" className="flex-shrink-0">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            )}
          </div>

          {/* Step 2: Convert */}
           <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
              <span className="font-bold text-lg">2</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">Convert to Hinglish</h3>
              <p className="text-sm text-muted-foreground">Let our AI work its magic.</p>
            </div>
            <Button onClick={handleConvert} disabled={!file || isLoading || !!hinglishContent} className="w-[120px] flex-shrink-0">
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Convert
                </>
              )}
            </Button>
          </div>
          
          {isLoading && (
            <div className="pl-14 pr-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Converting... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Step 3: Download */}
           <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
              <span className="font-bold text-lg">3</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">Download File</h3>
              <p className="text-sm text-muted-foreground">Save your new Hinglish SRT file.</p>
            </div>
            <Button onClick={handleDownload} disabled={!hinglishContent || isLoading} className="w-[120px] flex-shrink-0">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {file && (
          <>
            <Separator className="my-8" />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center font-headline">SRT Content Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-center mb-2">Input (Hindi)</h4>
                  <ScrollArea className="h-72 w-full rounded-md border bg-muted/20">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                      {hindiContent}
                    </pre>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-semibold text-center mb-2">Output (Hinglish)</h4>
                   <div className="h-72 w-full rounded-md border relative bg-muted/20">
                    {(isLoading || hinglishContent) ? (
                      <ScrollArea className="h-full w-full">
                        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                          {hinglishContent}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <div className="flex h-full items-center justify-center p-4">
                          <p className="text-sm text-center text-muted-foreground">Click 'Convert' to see the result here.</p>
                      </div>
                    )}
                    {isLoading && !hinglishContent && (
                       <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="text-center justify-center">
        <p className="text-xs text-muted-foreground">Powered by Generative AI.</p>
      </CardFooter>
    </Card>
  );
}
