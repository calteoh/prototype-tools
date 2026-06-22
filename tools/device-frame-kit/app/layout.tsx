import type { Metadata } from "next";
import { DeviceFrame } from "../device-frame/DeviceFrame";
import "./globals.css";

export const metadata: Metadata = {
  title: "Device Frame Kit — demo",
  description: "Present mobile-web prototypes inside a simulated phone on desktop.",
};

/*
 * The entire integration: wrap your layout's children in <DeviceFrame>.
 * Everything else is configured in device-frame/device-frame.config.ts.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DeviceFrame>{children}</DeviceFrame>
      </body>
    </html>
  );
}
