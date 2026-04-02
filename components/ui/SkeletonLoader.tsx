import { Skeleton } from "./skeleton";
import { Card, CardHeader, CardContent } from "./card";
import { Users, TrendingUp, Zap } from "lucide-react";

export const SkeletonLoader = () => (
  <div className="mx-auto max-w-xl flex flex-col gap-6 py-8">
         {/* Stats Bar Skeleton
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {[...Array(3)].map((_, index) => (
        <div key={`stats-${index}`} className="glass-premium rounded-lg p-2 text-center">
          <Skeleton className="w-5 h-5 mx-auto mb-1 rounded" />
          <Skeleton className="h-6 w-16 mx-auto mb-1 rounded" />
          <Skeleton className="h-3 w-20 mx-auto rounded" />
        </div>
      ))}
    </div> */}
    {[...Array(5)].map((_, index) => (
      <Card key={index} className="shadow-md">
        {/* Header */}
        <CardHeader className="flex flex-row items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-48 rounded" /> {/* Date */}
            <Skeleton className="h-4 w-32 rounded" /> {/* Name */}
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </CardHeader>

        {/* Post content */}
        <CardContent className="text-sm p-0 mt-2 flex flex-col gap-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          {/* <Skeleton className="h-4 w-full rounded" /> */}
        </CardContent>

        {/* Image placeholder */}
        <Skeleton className="w-full h-64 rounded-md mt-3" />
        
         <div className="flex flex-row items-center justify-center gap-32 mt-1 px-2 py-3">
          <Skeleton className="h-8 w-12 rounded-full " /> {/* Like */}
          <Skeleton className="h-8 w-16 rounded-full" /> {/* Comment */}
          {/* <Skeleton className="h-8 w-12 rounded-full" /> Share */}
        </div>
      </Card>
    ))}
  </div>
);
