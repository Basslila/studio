"use client";

import * as React from 'react';
import { Upload, Download, Wand2, Loader2, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { convertHindiToHinglish } from '@/ai/flows/convert-hindi-to-hinglish';

export function SrtConverter() {
  const [file, setFile] = React.useState<File | null>(null);
  const [hindiContent, setHindiContent] = React.useState<string | null>(null);
  const [hinglishContent, setHinglishContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.srt')) {
      setFile(selectedFile);
      setHinglishContent(null);
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
    setHinglishContent(null);
    try {
      const result = await convertHindiToHinglish({ srtContent: hindiContent });
      setHinglishContent(result.hinglishSrtContent);
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
      <CardContent className="space-y-6">
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

        {/* Step 3: Download */}
         <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
            <span className="font-bold text-lg">3</span>
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">Download File</h3>
            <p className="text-sm text-muted-foreground">Save your new Hinglish SRT file.</p>
          </div>
          <Button onClick={handleDownload} disabled={!hinglishContent} className="w-[120px] flex-shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-center justify-center">
        <p className="text-xs text-muted-foreground">Powered by Generative AI.</p>
      </CardFooter>
    </Card>
  );
}
