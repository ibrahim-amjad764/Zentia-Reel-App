"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { ImageIcon, X, Send, Sparkles, Plus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "../../../components/ui/progress";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_CHARACTER_LIMIT = 500;

export function CreatePostModal({ open, onClose, onSuccess }: Props) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{ file: File; url?: string; progress: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTER_LIMIT) {
      setContent(value);
    }
  };

  const sanitizedImages = images.filter((img): img is string => Boolean(img));

  const uploadImageToCloudinaryWithProgress = async (
    file: File,
    onProgress: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress(percentCompleted);
      },
    });
    return response.data.urls[0];
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    if (files.length + images.length > 6) {
      toast.error("Max 6 images allowed");
      return;
    }

    const newUploads = Array.from(files).map((file) => ({ file, progress: 0 }));
    setUploadingImages((prev) => [...prev, ...newUploads]);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const uploadedUrl = await uploadImageToCloudinaryWithProgress(
          files[i],
          (progress) => {
            setUploadingImages((prev) =>
              prev.map((img, idx) =>
                idx === prev.length - files.length + i
                  ? { ...img, progress }
                  : img
              )
            );
          }
        );
        setImages((prev) => [...prev, uploadedUrl]);
        setUploadingImages((prev) =>
          prev.map((img, idx) =>
            idx === prev.length - files.length + i
              ? { ...img, url: uploadedUrl, progress: 100 }
              : img
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Image upload failed");
    } finally {
      setUploadingImages((prev) => prev.filter((img) => !img.url));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (activeIndex >= newImages.length) {
      setActiveIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Post content or an image is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, images }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error || "Something went wrong");
        return;
      }

      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
      setImages([]);
      setActiveIndex(0);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (activeIndex < sanitizedImages.length - 1) setActiveIndex(activeIndex + 1);
  };

  const prevImage = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const charCountRatio = content.length / MAX_CHARACTER_LIMIT;

  return (
    <Dialog isOpen={open} onClose={onClose}>
      <DialogContent className="max-w-xl surface-glass shadow-neon rounded-3xl border border-white/20 p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 px-18 text-center">
                    Create New Post
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium px-10">
                    Share your story with the world in style.
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="relative group">
              <Textarea
                placeholder="What's happening? Share a thought, a reel, or a moment..."
                value={content}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white/5 border border-white/10 text-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-2xl resize-none transition-all duration-300 p-4 min-h-[160px] placeholder:italic"
              />
              
              {/* Character Counter Ring */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
                <div 
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${
                    charCountRatio > 0.9 
                      ? "text-destructive border-destructive/30 bg-destructive/5" 
                      : charCountRatio > 0.7 
                        ? "text-orange-500 border-orange-500/30 bg-orange-500/5"
                        : "text-muted-foreground border-white/10 bg-white/5"
                  }`}
                >
                  {content.length} / {MAX_CHARACTER_LIMIT}
                </div>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={fileRef}
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Media Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  Media Assets
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">
                    {images.length}/6
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  className="h-8 rounded-xl hover:bg-primary/10 hover:text-orange-500 transition-colors text-xs font-bold"
                  disabled={images.length >= 6 || loading}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Images
                </Button>
              </div>

              {/* Uploading States */}
              <AnimatePresence>
                {uploadingImages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-3 sm:grid-cols-6 gap-3"
                  >
                    {uploadingImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group shadow-lg">
                        <img
                          src={URL.createObjectURL(img.file)}
                          alt="Uploading"
                          className="w-full h-full object-cover blur-sm opacity-60"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-black/40">
                          <Progress value={img.progress} className="h-1.5 w-full mb-2 bg-white/10" />
                          <span className="text-[10px] text-white font-black tracking-tighter">
                            {img.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image Grid/Carousel */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {images.map((img, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={img}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                        i === activeIndex ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "border-white/10 hover:border-white/30"
                      }`}
                      onClick={() => setActiveIndex(i)}
                    >
                      <Image
                        src={img}
                        alt={`Preview ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:scale-110"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                  {images.length < 6 && !loading && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center transition-all group"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold text-muted-foreground mt-1 group-hover:text-orangee-500">Add More</span>
                    </button>
                  )}
                </div>
              )}

              {/* Main Preview (if images exist) */}
              {images.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/20"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={images[activeIndex]}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[activeIndex]}
                        alt="Selected media"
                        fill
                        className="object-contain lg:object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {images.length > 1 && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 px-4 pointer-events-none">
                      {images.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            i === activeIndex ? "w-8 bg-primary shadow-glow" : "w-2 bg-white/20"
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between gap-4 bg-white/[0.02]">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 rounded-2xl border-white/10 hover:bg-white/5 font-bold transition-all"
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && images.length === 0)}
              className="flex-1 max-w-[200px] rounded-2xl bg-primary hover:bg-orange-500 text-primary-foreground font-black text-sm uppercase tracking-wider py-6 shadow-glow relative overflow-hidden group transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                   <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Publishing...
                   </span>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Share Post
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
