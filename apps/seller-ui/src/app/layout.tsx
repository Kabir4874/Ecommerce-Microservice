import "./global.css";
import Providers from "./providers";

export const metadata = {
  title: "Luxora Seller",
  description: "Luxora Seller",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
