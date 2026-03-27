'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  next: () => void;
  threshold?: number;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
}

const InfiniteScroll = ({
  children,
  hasMore,
  isLoading,
  next,
  threshold = 100,
  loader = <Loader2 className="my-4 h-8 w-8 animate-spin" />,
  endMessage = <p className="text-center py-4 text-muted-foreground">No more content to show.</p>,
}: InfiniteScrollProps) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Observer callback function
  const handleObserver = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (entry.isIntersecting && hasMore && !isLoading) {
      next();
    }
  };

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => observer.current?.disconnect();
  }, [hasMore, isLoading, threshold]);

  return (
    <div>
      {children}

      <div ref={loadMoreRef} className="flex justify-center items-center">
        {isLoading ? (
          loader
        ) : hasMore ? (
          <div className="py-4 text-center">{loader}</div>
        ) : (
          <div>{endMessage}</div>
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll;
