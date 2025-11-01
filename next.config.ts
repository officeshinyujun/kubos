import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  sassOptions: {
    prependData: `
      @use "@/constants/COLORS.scss" as *;
      @use "@/constants/FONTS.scss" as *;
      @use "@/constants/SPACING.scss" as *;
    `,
  },
};

export default nextConfig;
