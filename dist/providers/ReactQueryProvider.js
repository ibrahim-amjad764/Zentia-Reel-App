//src/provider/QueryClientProvider
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const client = new QueryClient();
export function ReactQueryProvider({ children }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
