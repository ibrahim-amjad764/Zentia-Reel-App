"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleShareOption = (option: string) => {
    setIsOpen(false);
    toast(`Coming Soon: Shared via ${option}`);
  };

  return (
    <>
      {/* Trigger button with motion */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        > */}
        <div className="relative z-10">
        <DialogTrigger onOpen={() => setIsOpen(true)}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-800 hover:text-green-500 dark:text-white dark:hover:text-green-500 transition-colors duration-200 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          >
            <Share2 className="h-4 w-4 mr-1 " /> Share
          </Button>
        </DialogTrigger>
      {/* </motion.div> */}

      {/* Modal with AnimatePresence and motion */}
      {/* <AnimatePresence> */}
        {isOpen && (
          <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <DialogContent className="sm:max-w-[300px]">
              {/* <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col"
              > */}
                <DialogHeader>
                  <DialogTitle>Share Post</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-2 mt-2">
                  <Button
                    variant="outline"
                    className="bg-gray-200 px-6 py-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 dark:bg-cyan-900 dark:hover:bg-white dark:hover:text-black"
                    onClick={() => handleShareOption("Facebook")}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-200 px-6 py-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 dark:bg-cyan-900 dark:hover:bg-white dark:hover:text-black"
                    onClick={() => handleShareOption("Instagram")}
                  >
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-200 px-6 py-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 dark:bg-cyan-900 dark:hover:bg-white dark:hover:text-black"
                    onClick={() => handleShareOption("Twitter")}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-200 px-6 py-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 dark:bg-cyan-900 dark:hover:bg-white dark:hover:text-black"
                    onClick={() => handleShareOption("Copy Link")}
                  >
                    Copy Link
                  </Button>
                </div>
              {/* </motion.div> */}
            </DialogContent>
          </Dialog>
        )}
        </div>
      {/* </AnimatePresence> */}
    </>
  );
}