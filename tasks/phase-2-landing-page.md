# Phase 2: Landing Page

## Overview
Build a modern, conversion-focused landing page with a dark theme and violet accents. The page should communicate value clearly and feel distinct from competitors.

**Reference**: SPECIFICATION.md - Section 5 (Landing Page Specification)

---

## Task 2.1: Create Landing Page Layout

### Description
Set up the main landing page structure with header navigation.

### Files to Create
```
client/src/pages/Landing/index.tsx
client/src/components/landing/Header.tsx
client/src/components/landing/MobileMenu.tsx
```

### Component: Header.tsx
```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Group,
  Button,
  Container,
  Burger,
  Drawer,
  Stack,
  Text,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSparkles } from '@tabler/icons-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <Box
      component="header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 15, 18, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--mantine-color-dark-6)',
      }}
    >
      <Container size="xl" py="md">
        <Group justify="space-between">
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs">
              <IconSparkles size={28} color="var(--mantine-color-violet-5)" />
              <Text fw={700} size="xl" c="white">
                CallMentor Pro
              </Text>
            </Group>
          </Link>

          {/* Desktop Nav */}
          <Group gap="xl" visibleFrom="sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: 'none',
                  color: 'var(--mantine-color-gray-4)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--mantine-color-gray-4)'}
              >
                {link.label}
              </a>
            ))}
          </Group>

          {/* CTA Buttons */}
          <Group gap="sm" visibleFrom="sm">
            <Button
              component={Link}
              to="/login"
              variant="subtle"
              color="gray"
            >
              Sign In
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="gradient"
              gradient={{ from: 'violet.7', to: 'violet.5' }}
            >
              Start Free Trial
            </Button>
          </Group>

          {/* Mobile Menu */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            color="white"
          />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title="Menu"
        hiddenFrom="sm"
        size="100%"
        styles={{
          header: { backgroundColor: 'var(--mantine-color-dark-8)' },
          body: { backgroundColor: 'var(--mantine-color-dark-8)' },
        }}
      >
        <Stack gap="lg" mt="xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              style={{
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.2rem',
              }}
            >
              {link.label}
            </a>
          ))}
          <Button
            component={Link}
            to="/login"
            variant="subtle"
            fullWidth
            mt="xl"
          >
            Sign In
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="gradient"
            gradient={{ from: 'violet.7', to: 'violet.5' }}
            fullWidth
          >
            Start Free Trial
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Header renders with logo
- [ ] Navigation links scroll to sections
- [ ] CTA buttons link to auth pages
- [ ] Mobile menu works
- [ ] Header is fixed with blur backdrop

---

## Task 2.2: Build Hero Section

### Description
Create an impactful hero section with headline, subheadline, CTAs, and dashboard preview.

### Files to Create
```
client/src/components/landing/HeroSection.tsx
```

### Component Implementation
```typescript
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Box,
  ThemeIcon,
  Image,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconCheck,
  IconArrowRight,
  IconPlayerPlay,
} from '@tabler/icons-react';

const trustSignals = [
  '7-day free trial',
  'No credit card required',
  'Setup in 5 minutes',
];

export function HeroSection() {
  return (
    <Box
      py={{ base: 80, md: 120 }}
      style={{
        background: 'linear-gradient(180deg, var(--mantine-color-dark-9) 0%, var(--mantine-color-dark-8) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient orbs */}
      <Box
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          {/* Badge */}
          <Box
            px="md"
            py="xs"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 20,
            }}
          >
            <Text size="sm" c="violet.4" fw={500}>
              AI-Powered Conversation Intelligence
            </Text>
          </Box>

          {/* Headline */}
          <Title
            order={1}
            ta="center"
            size={48}
            fw={700}
            style={{
              maxWidth: 800,
              lineHeight: 1.2,
            }}
            c="white"
          >
            From Raw Conversations to{' '}
            <Text
              component="span"
              variant="gradient"
              gradient={{ from: 'violet.4', to: 'violet.6' }}
              inherit
            >
              Actionable Coaching
            </Text>
            {' '}- Instantly
          </Title>

          {/* Subheadline */}
          <Text
            size="xl"
            c="dimmed"
            ta="center"
            maw={600}
          >
            Transform every sales call into a growth opportunity with AI-powered
            analytics, performance scoring, and personalized coaching insights.
          </Text>

          {/* CTA Buttons */}
          <Group mt="md">
            <Button
              component={Link}
              to="/register"
              size="lg"
              variant="gradient"
              gradient={{ from: 'violet.7', to: 'violet.5' }}
              rightSection={<IconArrowRight size={18} />}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              color="gray"
              leftSection={<IconPlayerPlay size={18} />}
            >
              Watch Demo
            </Button>
          </Group>

          {/* Trust Signals */}
          <Group gap="lg" mt="sm">
            {trustSignals.map((signal) => (
              <Group key={signal} gap="xs">
                <ThemeIcon
                  size="sm"
                  variant="transparent"
                  color="green"
                >
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {signal}
                </Text>
              </Group>
            ))}
          </Group>

          {/* Dashboard Preview */}
          <Box
            mt={60}
            p="xs"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
              borderRadius: 16,
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <Box
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Replace with actual dashboard screenshot */}
              <Box
                h={400}
                w={{ base: 320, sm: 600, md: 900 }}
                style={{
                  background: 'var(--mantine-color-dark-7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text c="dimmed">Dashboard Preview</Text>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Headline is impactful
- [ ] Gradient text effect works
- [ ] CTAs are prominent
- [ ] Trust signals visible
- [ ] Dashboard preview placeholder
- [ ] Responsive on mobile

---

## Task 2.3: Build Problem Section

### Description
Create a section highlighting the pain points that resonate with target users.

### Files to Create
```
client/src/components/landing/ProblemSection.tsx
```

### Component Implementation
```typescript
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Stack,
  Box,
  ThemeIcon,
} from '@mantine/core';
import {
  IconClock,
  IconEyeOff,
  IconChartBar,
} from '@tabler/icons-react';

const painPoints = [
  {
    icon: IconClock,
    stat: '8+ Hours/Week',
    title: 'Lost to Manual Reviews',
    description: 'Sales leaders spend countless hours listening to calls, yet still miss critical coaching moments.',
  },
  {
    icon: IconEyeOff,
    stat: '90% of Calls',
    title: 'Never Get Reviewed',
    description: 'Most conversations happen without any analysis, leaving potential improvements undiscovered.',
  },
  {
    icon: IconChartBar,
    stat: 'Inconsistent',
    title: 'Coaching Quality',
    description: 'Without data, feedback varies by manager mood and memory rather than objective performance.',
  },
];

export function ProblemSection() {
  return (
    <Box py={{ base: 60, md: 100 }} bg="dark.8">
      <Container size="xl">
        <Stack align="center" gap="xl">
          {/* Section Title */}
          <Stack align="center" gap="sm" maw={600}>
            <Title order={2} ta="center" c="white">
              Your Sales Team Deserves Better
            </Title>
            <Text c="dimmed" ta="center" size="lg">
              These challenges sound familiar? You're not alone.
            </Text>
          </Stack>

          {/* Pain Point Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt="xl">
            {painPoints.map((point) => (
              <Card
                key={point.title}
                padding="xl"
                bg="dark.7"
                style={{
                  border: '1px solid var(--mantine-color-dark-5)',
                }}
              >
                <Stack align="center" gap="md" ta="center">
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    variant="light"
                    color="red"
                  >
                    <point.icon size={30} />
                  </ThemeIcon>
                  <Text
                    size="xl"
                    fw={700}
                    c="white"
                  >
                    {point.stat}
                  </Text>
                  <Text fw={600} c="white" size="lg">
                    {point.title}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {point.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>

          {/* Supporting Quote */}
          <Box
            mt={40}
            p="xl"
            style={{
              background: 'rgba(139, 92, 246, 0.05)',
              borderLeft: '4px solid var(--mantine-color-violet-5)',
              borderRadius: 8,
              maxWidth: 700,
            }}
          >
            <Text size="lg" c="dimmed" fs="italic">
              "We were flying blind. With 20 reps making 100+ calls daily,
              there was no way to know what was working until quota time."
            </Text>
            <Text size="sm" c="dimmed" mt="sm">
              — Sales Director, SaaS Company
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Three pain points displayed
- [ ] Stats are prominent
- [ ] Cards have consistent styling
- [ ] Quote adds credibility
- [ ] Responsive layout

---

## Task 2.4: Build How It Works Section

### Description
Create a 3-step process explanation with visual flow.

### Files to Create
```
client/src/components/landing/HowItWorksSection.tsx
```

### Component Implementation
```typescript
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Box,
  ThemeIcon,
  Group,
} from '@mantine/core';
import {
  IconUpload,
  IconBrain,
  IconTrendingUp,
  IconArrowRight,
} from '@tabler/icons-react';

const steps = [
  {
    number: '01',
    icon: IconUpload,
    title: 'Capture',
    description: 'Upload call recordings or paste transcripts. Supports audio files and text input.',
    details: ['Audio files (MP3, WAV)', 'Text transcripts', 'CRM integrations'],
  },
  {
    number: '02',
    icon: IconBrain,
    title: 'Analyze',
    description: 'AI processes each conversation, evaluating key performance dimensions.',
    details: ['Talk ratio analysis', 'Objection detection', 'Sentiment scoring'],
  },
  {
    number: '03',
    icon: IconTrendingUp,
    title: 'Coach',
    description: 'Get personalized coaching insights and track improvement over time.',
    details: ['Actionable feedback', 'Specific quotes', 'Progress tracking'],
  },
];

export function HowItWorksSection() {
  return (
    <Box py={{ base: 60, md: 100 }} id="how-it-works">
      <Container size="xl">
        <Stack align="center" gap="xl">
          {/* Section Title */}
          <Stack align="center" gap="sm" maw={600}>
            <Text size="sm" tt="uppercase" fw={600} c="violet.4">
              How It Works
            </Text>
            <Title order={2} ta="center" c="white">
              Three Steps to Better Coaching
            </Title>
            <Text c="dimmed" ta="center" size="lg">
              Get started in minutes, see results immediately.
            </Text>
          </Stack>

          {/* Steps */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing={50} mt="xl">
            {steps.map((step, index) => (
              <Box key={step.title} style={{ position: 'relative' }}>
                {/* Connector Arrow (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <Box
                    visibleFrom="md"
                    style={{
                      position: 'absolute',
                      top: 40,
                      right: -30,
                      color: 'var(--mantine-color-dark-4)',
                    }}
                  >
                    <IconArrowRight size={24} />
                  </Box>
                )}

                <Stack align="center" gap="md" ta="center">
                  {/* Step Number */}
                  <Text
                    size="sm"
                    fw={700}
                    c="violet.5"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: 20,
                    }}
                  >
                    Step {step.number}
                  </Text>

                  {/* Icon */}
                  <ThemeIcon
                    size={80}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: 'violet.7', to: 'violet.5' }}
                  >
                    <step.icon size={40} />
                  </ThemeIcon>

                  {/* Title */}
                  <Title order={3} c="white">
                    {step.title}
                  </Title>

                  {/* Description */}
                  <Text c="dimmed" size="md">
                    {step.description}
                  </Text>

                  {/* Details */}
                  <Stack gap="xs" mt="sm">
                    {step.details.map((detail) => (
                      <Group key={detail} gap="xs" justify="center">
                        <Box
                          w={6}
                          h={6}
                          style={{
                            borderRadius: '50%',
                            background: 'var(--mantine-color-violet-5)',
                          }}
                        />
                        <Text size="sm" c="dimmed">
                          {detail}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Three steps clearly shown
- [ ] Step numbers visible
- [ ] Icons are distinct
- [ ] Arrow connectors on desktop
- [ ] Details listed
- [ ] Responsive layout

---

## Task 2.5: Build Features Section

### Description
Create a features grid showcasing the 4 core capabilities.

### Files to Create
```
client/src/components/landing/FeaturesSection.tsx
```

### Component Implementation
```typescript
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Stack,
  Box,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import {
  IconChartBar,
  IconTarget,
  IconBulb,
  IconUsers,
} from '@tabler/icons-react';

const features = [
  {
    icon: IconChartBar,
    title: 'Smart Scoring',
    badge: 'AI-Powered',
    description: 'Objective 0-100 scores across 6 key dimensions with detailed breakdown and reasoning.',
    highlights: ['Discovery skills', 'Talk balance', 'Objection handling'],
  },
  {
    icon: IconTarget,
    title: 'Objection Radar',
    badge: 'Auto-detect',
    description: 'Automatic detection of objections with analysis of how they were handled or missed.',
    highlights: ['Pricing concerns', 'Timeline issues', 'Competition mentions'],
  },
  {
    icon: IconBulb,
    title: 'AI Coach',
    badge: 'Personalized',
    description: 'Personalized feedback with specific quotes from the conversation and improvement suggestions.',
    highlights: ['Specific examples', 'Action items', 'Best practices'],
  },
  {
    icon: IconUsers,
    title: 'Team Insights',
    badge: 'Analytics',
    description: 'Aggregate performance dashboards and rep comparisons to identify trends and opportunities.',
    highlights: ['Performance trends', 'Top performers', 'Coaching priorities'],
  },
];

export function FeaturesSection() {
  return (
    <Box py={{ base: 60, md: 100 }} bg="dark.8" id="features">
      <Container size="xl">
        <Stack align="center" gap="xl">
          {/* Section Title */}
          <Stack align="center" gap="sm" maw={600}>
            <Text size="sm" tt="uppercase" fw={600} c="violet.4">
              Features
            </Text>
            <Title order={2} ta="center" c="white">
              Everything You Need in One Platform
            </Title>
            <Text c="dimmed" ta="center" size="lg">
              Powerful tools designed specifically for sales coaching excellence.
            </Text>
          </Stack>

          {/* Feature Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mt="xl">
            {features.map((feature) => (
              <Card
                key={feature.title}
                padding="xl"
                bg="dark.7"
                style={{
                  border: '1px solid var(--mantine-color-dark-5)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-violet-7)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-dark-5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Stack gap="md">
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <ThemeIcon
                      size={50}
                      radius="md"
                      variant="light"
                      color="violet"
                    >
                      <feature.icon size={26} />
                    </ThemeIcon>
                    <Badge variant="light" color="violet" size="sm">
                      {feature.badge}
                    </Badge>
                  </Box>

                  <Title order={3} c="white" size="h4">
                    {feature.title}
                  </Title>

                  <Text c="dimmed" size="sm">
                    {feature.description}
                  </Text>

                  <Stack gap="xs">
                    {feature.highlights.map((highlight) => (
                      <Text key={highlight} size="xs" c="dimmed">
                        • {highlight}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Four feature cards display
- [ ] Icons and badges present
- [ ] Hover effects work
- [ ] Highlights listed
- [ ] Responsive grid

---

## Task 2.6: Build Social Proof Section

### Description
Create a section with testimonials and trust metrics.

### Files to Create
```
client/src/components/landing/SocialProofSection.tsx
```

### Implementation
```typescript
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Box,
  Avatar,
  Group,
  Card,
  Rating,
} from '@mantine/core';
import { IconQuote } from '@tabler/icons-react';

const testimonial = {
  quote: "CallMentor Pro gave us visibility we never had before. Our team's average score improved 27% in just 8 weeks. The coaching suggestions are incredibly specific and actionable.",
  author: 'David Chen',
  role: 'Head of Sales',
  company: 'GrowthTech',
  avatar: null,
};

const stats = [
  { value: '10,000+', label: 'Calls Analyzed' },
  { value: '4.8★', label: 'User Rating' },
  { value: '27%', label: 'Avg Improvement' },
];

export function SocialProofSection() {
  return (
    <Box py={{ base: 60, md: 100 }}>
      <Container size="xl">
        <Stack align="center" gap={60}>
          {/* Section Title */}
          <Stack align="center" gap="sm">
            <Text size="sm" tt="uppercase" fw={600} c="violet.4">
              Trusted by Teams
            </Text>
            <Title order={2} ta="center" c="white">
              Forward-Thinking Sales Teams Choose Us
            </Title>
          </Stack>

          {/* Company Logos Placeholder */}
          <Group gap="xl" justify="center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                w={100}
                h={40}
                style={{
                  background: 'var(--mantine-color-dark-6)',
                  borderRadius: 8,
                  opacity: 0.5,
                }}
              />
            ))}
          </Group>

          {/* Testimonial */}
          <Card
            padding="xl"
            bg="dark.7"
            maw={700}
            style={{
              border: '1px solid var(--mantine-color-dark-5)',
            }}
          >
            <Stack gap="lg">
              <IconQuote
                size={40}
                color="var(--mantine-color-violet-5)"
                style={{ opacity: 0.5 }}
              />
              <Text size="lg" c="white" lh={1.7}>
                "{testimonial.quote}"
              </Text>
              <Group>
                <Avatar
                  size="md"
                  radius="xl"
                  color="violet"
                >
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Text fw={600} c="white" size="sm">
                    {testimonial.author}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {testimonial.role} @ {testimonial.company}
                  </Text>
                </Box>
              </Group>
            </Stack>
          </Card>

          {/* Stats */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {stats.map((stat) => (
              <Stack key={stat.label} align="center" gap="xs">
                <Text
                  size="3rem"
                  fw={700}
                  variant="gradient"
                  gradient={{ from: 'violet.4', to: 'violet.6' }}
                >
                  {stat.value}
                </Text>
                <Text c="dimmed" size="sm">
                  {stat.label}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>

          {/* MVP Note */}
          <Text size="xs" c="dimmed" ta="center">
            * Example testimonial for demonstration purposes
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Testimonial card displays
- [ ] Stats are prominent
- [ ] Logo placeholders shown
- [ ] MVP disclaimer present
- [ ] Responsive layout

---

## Task 2.7: Build Pricing Section

### Description
Create a 3-tier pricing display.

### Files to Create
```
client/src/components/landing/PricingSection.tsx
```

### Implementation
```typescript
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Stack,
  Box,
  Button,
  List,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconCheck } from '@tabler/icons-react';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams getting started',
    features: [
      '5 team members',
      '100 calls/month',
      'Basic scoring',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$146',
    period: '/month',
    description: 'For growing teams that need more',
    features: [
      '20 team members',
      '500 calls/month',
      'Full AI scoring',
      'AI coaching insights',
      'Team analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited members',
      'Unlimited calls',
      'Custom AI training',
      'SSO & API access',
      'Dedicated CSM',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <Box py={{ base: 60, md: 100 }} bg="dark.8" id="pricing">
      <Container size="xl">
        <Stack align="center" gap="xl">
          {/* Section Title */}
          <Stack align="center" gap="sm" maw={600}>
            <Text size="sm" tt="uppercase" fw={600} c="violet.4">
              Pricing
            </Text>
            <Title order={2} ta="center" c="white">
              Simple, Transparent Pricing
            </Title>
            <Text c="dimmed" ta="center" size="lg">
              Start free, upgrade when you're ready. No hidden fees.
            </Text>
          </Stack>

          {/* Pricing Cards */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                padding="xl"
                bg={plan.popular ? 'dark.6' : 'dark.7'}
                style={{
                  border: plan.popular
                    ? '2px solid var(--mantine-color-violet-5)'
                    : '1px solid var(--mantine-color-dark-5)',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'none',
                }}
              >
                {plan.popular && (
                  <Badge
                    color="violet"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    Most Popular
                  </Badge>
                )}

                <Stack gap="lg">
                  <Box>
                    <Text fw={600} size="lg" c="white">
                      {plan.name}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {plan.description}
                    </Text>
                  </Box>

                  <Box>
                    <Text
                      component="span"
                      size="3rem"
                      fw={700}
                      c="white"
                    >
                      {plan.price}
                    </Text>
                    <Text component="span" c="dimmed" size="sm">
                      {plan.period}
                    </Text>
                  </Box>

                  <List
                    spacing="sm"
                    icon={
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="violet"
                        variant="light"
                      >
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    {plan.features.map((feature) => (
                      <List.Item key={feature}>
                        <Text size="sm" c="dimmed">
                          {feature}
                        </Text>
                      </List.Item>
                    ))}
                  </List>

                  <Button
                    component={Link}
                    to="/register"
                    variant={plan.popular ? 'gradient' : 'outline'}
                    gradient={{ from: 'violet.7', to: 'violet.5' }}
                    color={plan.popular ? undefined : 'gray'}
                    fullWidth
                    mt="auto"
                  >
                    {plan.cta}
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Three pricing tiers
- [ ] Popular plan highlighted
- [ ] Features listed
- [ ] CTAs link correctly
- [ ] Responsive layout

---

## Task 2.8: Build CTA Section

### Description
Create a final call-to-action section.

### Files to Create
```
client/src/components/landing/CTASection.tsx
```

### Implementation
```typescript
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Box,
  Group,
  ThemeIcon,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconCheck, IconArrowRight } from '@tabler/icons-react';

const benefits = [
  'No credit card required',
  'Setup in under 5 minutes',
  'Cancel anytime',
];

export function CTASection() {
  return (
    <Box
      py={{ base: 80, md: 120 }}
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-violet-9) 0%, var(--mantine-color-dark-9) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background effect */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />

      <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" ta="center">
          <Title order={2} c="white" size="2.5rem">
            Ready to Transform Your Sales Coaching?
          </Title>

          <Text c="gray.4" size="xl" maw={500}>
            Join hundreds of sales teams already using CallMentor Pro
            to drive performance improvement.
          </Text>

          <Button
            component={Link}
            to="/register"
            size="xl"
            variant="white"
            color="violet"
            rightSection={<IconArrowRight size={20} />}
          >
            Start Your Free Trial
          </Button>

          <Group gap="lg">
            {benefits.map((benefit) => (
              <Group key={benefit} gap="xs">
                <ThemeIcon
                  size="sm"
                  variant="transparent"
                  color="green.4"
                >
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text size="sm" c="gray.4">
                  {benefit}
                </Text>
              </Group>
            ))}
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Strong headline
- [ ] Prominent CTA button
- [ ] Trust signals visible
- [ ] Gradient background
- [ ] Centered layout

---

## Task 2.9: Build Footer

### Description
Create the site footer with navigation links.

### Files to Create
```
client/src/components/landing/Footer.tsx
```

### Implementation
```typescript
import {
  Container,
  Text,
  SimpleGrid,
  Stack,
  Box,
  Group,
  Anchor,
  Divider,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconSparkles,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandYoutube,
} from '@tabler/icons-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Integrations', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Docs', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: IconBrandTwitter, href: '#' },
  { icon: IconBrandLinkedin, href: '#' },
  { icon: IconBrandYoutube, href: '#' },
];

export function Footer() {
  return (
    <Box bg="dark.9" py={{ base: 40, md: 60 }}>
      <Container size="xl">
        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="xl">
          {/* Logo & Description */}
          <Stack gap="md" style={{ gridColumn: 'span 2' }}>
            <Group gap="xs">
              <IconSparkles size={24} color="var(--mantine-color-violet-5)" />
              <Text fw={700} size="lg" c="white">
                CallMentor Pro
              </Text>
            </Group>
            <Text size="sm" c="dimmed" maw={300}>
              AI-powered conversation intelligence for sales teams that want to win.
            </Text>
            <Group gap="md" mt="sm">
              {socialLinks.map((social, index) => (
                <Anchor
                  key={index}
                  href={social.href}
                  c="dimmed"
                  style={{ transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--mantine-color-violet-5)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--mantine-color-gray-6)'}
                >
                  <social.icon size={20} />
                </Anchor>
              ))}
            </Group>
          </Stack>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <Stack key={section.title} gap="sm">
              <Text fw={600} size="sm" c="white">
                {section.title}
              </Text>
              {section.links.map((link) => (
                <Anchor
                  key={link.label}
                  href={link.href}
                  size="sm"
                  c="dimmed"
                  style={{ textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--mantine-color-gray-6)'}
                >
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          ))}
        </SimpleGrid>

        <Divider my="xl" color="dark.6" />

        <Text size="sm" c="dimmed" ta="center">
          © {new Date().getFullYear()} CallMentor Pro. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Footer links organized
- [ ] Social icons present
- [ ] Copyright updated
- [ ] Responsive columns
- [ ] Hover states work

---

## Task 2.10: Assemble Landing Page

### Description
Combine all sections into the complete landing page.

### Files to Modify
```
client/src/pages/Landing/index.tsx
```

### Implementation
```typescript
import { Box } from '@mantine/core';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <Box>
      <Header />
      <Box pt={64}> {/* Account for fixed header */}
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection />
        <CTASection />
      </Box>
      <Footer />
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] All sections render
- [ ] Smooth scrolling works
- [ ] No layout issues
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## Phase 2 Checklist Summary

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Create landing page layout & header | [ ] |
| 2.2 | Build hero section | [ ] |
| 2.3 | Build problem section | [ ] |
| 2.4 | Build how it works section | [ ] |
| 2.5 | Build features section | [ ] |
| 2.6 | Build social proof section | [ ] |
| 2.7 | Build pricing section | [ ] |
| 2.8 | Build CTA section | [ ] |
| 2.9 | Build footer | [ ] |
| 2.10 | Assemble landing page | [ ] |

---

## Dependencies for Next Phase
Before starting Phase 3 (Authentication), ensure:
- Landing page is complete and responsive
- Login/Register buttons link to auth pages
- Header navigation works
- Footer links are in place
