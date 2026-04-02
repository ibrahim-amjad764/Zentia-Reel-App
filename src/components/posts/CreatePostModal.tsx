"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle  } from "../../../components/ui/dialog";
import { useEffect ,useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";
import { Progress } from "../../../components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePostModal({ open, onClose, onSuccess }: Props) {
  
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{ file: File; url?: string; progress: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const sanitizedImages = images.filter((img): img is string => Boolean(img));

  // Upload image with progress
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
    console.log("Cloudinary response:", response.data);
    console.log("Uploaded image URL / token:", response.data.urls[0]);

    return response.data.urls[0];
  };

  // Handle selected files
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    if (files.length + images.length > 6) {
      toast.error("Max 6 images allowed");
      return;
    }

    const newUploads = Array.from(files).map((file) => ({ file, progress: 0 }));
    setUploadingImages((prev) => [...prev, ...newUploads]);
    //mutliple file upload with progress
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
        //image uploaded progress
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
      // Remove uploaded images from uploadingImages state
      setUploadingImages((prev) => prev.filter((img) => !img.url));
    }
  };

  // const handleSubmit = async () => {
  //   if (!content.trim()) {
  //     toast.error("Post content is required");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const res = await fetch("/api/posts", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ content, images }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       toast.error(data?.error || "Something went wrong");
  //       return;
  //     }

  //     toast.success("Post created successfully!");
  //     queryClient.invalidateQueries({ queryKey: ["posts"] });

  //     setContent("");
  //     setImages([]);
  //     setActiveIndex(0);
  //     onClose();
  //     if (onSuccess) onSuccess();
  //   } catch (err: any) {
  //     console.error(err);
  //     toast.error(err?.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
  if (!content.trim()) {
    toast.error("Post content is required");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, images }),
    });

    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Raw response text:", text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error("JSON parse error:", err);
      data = {};
    }

    if (!res.ok) {
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

  // Render

  return (
  <Dialog isOpen={open} onClose={onClose}> 
    <DialogContent className="max-w-lg surface-glass shadow-neon rounded-3xl border border-white/12">
      <DialogHeader>
  <DialogTitle>
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Create post
        </h2>
        <p className="text-xs text-muted-foreground/90">
          Share updates with a polished, futuristic feel.
        </p>
      </div>
      <div className="h-8 w-8 rounded-full bg-white/6 border border-white/10 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)]" />
    </div>
  </DialogTitle>
</DialogHeader>

      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={handleChange}
        rows={4}
        className="surface-glass border border-white/12 text-foreground placeholder:text-muted-foreground/70 ring-neon rounded-2xl resize-none"/>

      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        ref={fileRef}
        onChange={(e) => handleFiles(e.target.files)}/>

      {/* Image Carousel */}
      {sanitizedImages.length > 0 && (
        <div className="flex justify-center items-center mt-4">
          {/* <Button
            variant="secondary"
            onClick={prevImage}
            disabled={activeIndex === 0}
            className="mr-2 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            &lt;
          </Button> */}

          <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-white/12 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.85)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={sanitizedImages[activeIndex]}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={sanitizedImages[activeIndex]}
                  alt={`Post image ${activeIndex + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* <Button
            variant="secondary"
            onClick={nextImage}
            disabled={activeIndex === sanitizedImages.length - 1}
            className="ml-2 dark:bg-zinc-800 dark:hover:bg-zinc-700 ">
            &gt;
          </Button> */}
        </div>
      )}

      {/* Thumbnails */}
      <div className="flex gap-2 flex-wrap mt-4">
        {images.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={`Post image ${i + 1}`}
            width={80}
            height={80}
            className="rounded-xl object-cover border border-white/12 hover:border-white/20 transition-[transform,border-color] duration-200 ease-out hover:scale-[1.02]"/>
        ))}

        {uploadingImages.map((img, i) => (
          <div
            key={i}
            className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/6 border border-white/10 flex items-center justify-center" >
            <img
              src={URL.createObjectURL(img.file)}
              alt="Uploading"
              className="w-full h-full object-cover blur-sm" />
            <div className="absolute bottom-1 left-1 right-1">
              <Progress value={img.progress} />
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
              {img.progress}%
            </span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          className="rounded-full">
          Add Image
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-full" >
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
}