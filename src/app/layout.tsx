import "@/app/globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

export const metadata = { title: "PathoBooking" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-dvh bg-background text-foreground">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
