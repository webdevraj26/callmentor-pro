import { Box } from '@mantine/core';
import { Navbar } from '@/components/landing/Navbar';
import { HeroWithSelector } from '@/components/landing/HeroWithSelector';
import { StatsTicker } from '@/components/landing/StatsTicker';
import { BeforeAfter } from '@/components/landing/BeforeAfter';
import { ROICalculator } from '@/components/landing/ROICalculator';
import { FeatureSpotlight } from '@/components/landing/FeatureSpotlight';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { SuccessMetrics } from '@/components/landing/SuccessMetrics';
import { Integrations } from '@/components/landing/Integrations';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <Box bg="dark.9">
      <Navbar />
      <Box pt={56}>
        <HeroWithSelector />
        <StatsTicker />
        <BeforeAfter />
        <ROICalculator />
        <FeatureSpotlight />
        <ProductPreview />
        <SuccessMetrics />
        <Integrations />
        <FinalCTA />
      </Box>
      <Footer />
    </Box>
  );
}
