import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OptimizationResult, Optimization, ImpactEstimate } from '../types/schema.js';
import { projectDetector, FrameworkType } from '../common/project-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CodeOptimizer {
  private rules!: any;
  private framework: FrameworkType = 'unknown';

  constructor() {
    this.loadRules();
  }

  private loadRules(framework?: FrameworkType): void {
    // Detect framework if not provided
    if (!framework) {
      const projectInfo = projectDetector.detectFramework();
      framework = projectInfo.framework;
    }
    
    this.framework = framework;
    
    // Load appropriate rules based on framework
    const rulesFileName = framework === 'react' ? 'react-llm-best-practices.json' : 'nextjs-llm-best-practices.json';
    const rulesPath = path.join(__dirname, '../config', rulesFileName);
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
    this.rules = JSON.parse(rulesContent);
  }

  async optimizeCode(code: string, filePath: string): Promise<OptimizationResult> {
    // Detect framework for this specific file if needed
    const fileFramework = projectDetector.detectFrameworkForFile(filePath);
    if (fileFramework !== this.framework && fileFramework !== 'unknown') {
      this.loadRules(fileFramework);
    }

    const optimizations: Optimization[] = [];

    // Framework-specific optimizations
    if (this.framework === 'nextjs') {
      this.checkImageOptimization(code, optimizations);
      this.checkFontOptimization(code, optimizations);
      this.checkServerComponents(code, optimizations);
    } else {
      this.checkReactImageOptimization(code, optimizations);
      this.checkReactCodeSplitting(code, optimizations);
    }

    // Common optimizations
    this.checkDynamicImports(code, optimizations);
    this.checkBundleSize(code, optimizations);
    this.checkDataFetching(code, optimizations);

    // SEO optimizations (more relevant for Next.js but can apply to React too)
    if (this.framework === 'nextjs') {
      this.checkMetadata(code, filePath, optimizations);
      this.checkStructuredData(code, optimizations);
    }

    // Accessibility optimizations (common to both)
    this.checkAccessibility(code, optimizations);

    // Calculate estimated impact
    const estimatedImpact = this.estimateImpact(optimizations);

    // Sort by priority and impact
    optimizations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return {
      file: filePath,
      optimizations,
      estimatedImpact
    };
  }

  private checkReactImageOptimization(code: string, optimizations: Optimization[]): void {
    // Check for images without lazy loading
    if (/<img\s/.test(code) && !/loading=["']lazy["']/.test(code)) {
      optimizations.push({
        type: 'performance',
        title: 'Add lazy loading to images',
        description: 'Enable native lazy loading for better performance',
        priority: 'high',
        implementation: 'Add loading="lazy" attribute to images',
        codeExample: `
// Before
<img src="/photo.jpg" alt="Photo" />

// After
<img src="/photo.jpg" alt="Photo" loading="lazy" />
        `.trim()
      });
    }

    // Check for missing srcset
    if (/<img\s/.test(code) && !/<img[^>]*srcset=/.test(code)) {
      optimizations.push({
        type: 'performance',
        title: 'Use responsive images with srcset',
        description: 'Provide multiple image sizes for different screen sizes',
        priority: 'medium',
        implementation: 'Add srcset and sizes attributes',
        codeExample: `
<img 
  src="/photo-800.jpg"
  srcset="/photo-400.jpg 400w, /photo-800.jpg 800w, /photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Photo"
  loading="lazy"
/>
        `.trim()
      });
    }
  }

  private checkReactCodeSplitting(code: string, optimizations: Optimization[]): void {
    // Check for route-based code splitting
    const hasRoutes = /react-router|Route|Routes/.test(code);
    const hasLazy = /React\.lazy|lazy\(/.test(code);

    if (hasRoutes && !hasLazy) {
      optimizations.push({
        type: 'bundle-size',
        title: 'Implement route-based code splitting',
        description: 'Use React.lazy() for route components to reduce initial bundle size',
        priority: 'high',
        implementation: 'Wrap route components with React.lazy() and Suspense',
        codeExample: `
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
        `.trim()
      });
    }
  }

  private checkImageOptimization(code: string, optimizations: Optimization[]): void {
    // Check for unoptimized images
    if (/<img\s/.test(code)) {
      optimizations.push({
        type: 'performance',
        title: 'Replace img with Next.js Image',
        description: 'Use Next.js Image component for automatic optimization, lazy loading, and responsive images',
        priority: 'high',
        implementation: 'Replace all <img> tags with <Image> component from next/image',
        codeExample: `
import Image from 'next/image';

// Before
<img src="/photo.jpg" alt="Photo" />

// After
<Image 
  src="/photo.jpg" 
  alt="Photo" 
  width={500} 
  height={300}
  loading="lazy"
  placeholder="blur"
/>
        `.trim()
      });
    }

    // Check for missing image dimensions
    if (/<Image\s/.test(code) && !(/width=|fill/.test(code))) {
      optimizations.push({
        type: 'performance',
        title: 'Add image dimensions',
        description: 'Specify width and height to prevent layout shift',
        priority: 'medium',
        implementation: 'Add width and height props to Image components'
      });
    }
  }

  private checkFontOptimization(code: string, optimizations: Optimization[]): void {
    // Check for unoptimized fonts
    const hasCustomFonts = /@font-face|font-family/.test(code);
    const usesNextFont = /from ['"]next\/font/.test(code);

    if (hasCustomFonts && !usesNextFont) {
      optimizations.push({
        type: 'performance',
        title: 'Use Next.js Font Optimization',
        description: 'Automatically optimize fonts with next/font for better performance',
        priority: 'high',
        implementation: 'Import fonts using next/font/google or next/font/local',
        codeExample: `
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
});

export default function Layout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
        `.trim()
      });
    }
  }

  private checkDynamicImports(code: string, optimizations: Optimization[]): void {
    // Check for heavy components that could be dynamically imported
    const heavyComponents = [
      'Chart', 'Graph', 'Editor', 'Map', 'Video', 'Player',
      'Calendar', 'Table', 'DataGrid', 'Modal', 'Dialog'
    ];

    const hasHeavyComponents = heavyComponents.some(comp => 
      new RegExp(`import.*${comp}.*from`).test(code)
    );

    if (hasHeavyComponents && !code.includes('dynamic(')) {
      optimizations.push({
        type: 'bundle-size',
        title: 'Use dynamic imports for heavy components',
        description: 'Reduce initial bundle size by lazy loading heavy components',
        priority: 'high',
        implementation: 'Use next/dynamic to import heavy components',
        codeExample: `
import dynamic from 'next/dynamic';

// For client components
const Chart = dynamic(() => import('./Chart'), { 
  ssr: false,
  loading: () => <p>Loading chart...</p> 
});

// For server components (App Router)
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
});
        `.trim()
      });
    }
  }

  private checkBundleSize(code: string, optimizations: Optimization[]): void {
    // Check for large libraries in client components
    const isClientComponent = code.includes("'use client'");
    const largeLibraries = [
      { name: 'moment', alternative: 'date-fns or native Intl', size: '~70KB' },
      { name: 'lodash', alternative: 'lodash-es with tree-shaking or native methods', size: '~70KB' },
      { name: 'axios', alternative: 'native fetch API', size: '~13KB' },
      { name: 'jquery', alternative: 'native DOM APIs', size: '~90KB' }
    ];

    if (isClientComponent) {
      for (const lib of largeLibraries) {
        if (new RegExp(`from ['"]${lib.name}['"]`).test(code)) {
          optimizations.push({
            type: 'bundle-size',
            title: `Replace ${lib.name} with lighter alternative`,
            description: `${lib.name} adds ${lib.size} to client bundle. Consider ${lib.alternative}`,
            priority: 'high',
            implementation: `Replace ${lib.name} imports with ${lib.alternative}`
          });
        }
      }
    }

    // Check for barrel imports
    if (/import\s*{[^}]+}\s*from\s*['"]@\//.test(code)) {
      optimizations.push({
        type: 'bundle-size',
        title: 'Avoid barrel imports',
        description: 'Import directly from module files to improve tree-shaking',
        priority: 'medium',
        implementation: 'Import from specific files instead of index files'
      });
    }
  }

  private checkServerComponents(code: string, optimizations: Optimization[]): void {
    const isClientComponent = code.includes("'use client'");
    const hasInteractivity = /onClick|onChange|onSubmit|useState|useEffect/.test(code);
    const hasBrowserAPIs = /window\.|document\.|localStorage|sessionStorage/.test(code);

    if (isClientComponent && !hasInteractivity && !hasBrowserAPIs) {
      optimizations.push({
        type: 'performance',
        title: 'Convert to Server Component',
        description: 'This component doesn\'t need client-side JavaScript',
        priority: 'high',
        implementation: 'Remove "use client" directive and move to server-side rendering',
        codeExample: `
// Remove 'use client' directive
// This component will now run on the server
export default async function Component() {
  // Can now fetch data directly
  const data = await fetch('...');
  return <div>{/* ... */}</div>;
}
        `.trim()
      });
    }

    // Check for data fetching in client components
    if (isClientComponent && /useEffect.*fetch/.test(code)) {
      optimizations.push({
        type: 'performance',
        title: 'Move data fetching to Server Component',
        description: 'Fetch data on the server for better performance and SEO',
        priority: 'high',
        implementation: 'Create parent Server Component for data fetching',
        codeExample: `
// Parent Server Component
async function PageWithData() {
  const data = await fetch('...').then(r => r.json());
  return <ClientComponent data={data} />;
}

// Child Client Component (only for UI interactions)
'use client';
function ClientComponent({ data }) {
  const [selected, setSelected] = useState(null);
  return <div onClick={...}>{/* ... */}</div>;
}
        `.trim()
      });
    }
  }

  private checkDataFetching(code: string, optimizations: Optimization[]): void {
    // Check for sequential data fetching
    const fetchCount = (code.match(/await fetch\(/g) || []).length;
    if (fetchCount > 1 && !code.includes('Promise.all')) {
      optimizations.push({
        type: 'performance',
        title: 'Parallelize data fetching',
        description: 'Multiple sequential fetches cause waterfall delays',
        priority: 'high',
        implementation: 'Use Promise.all to fetch data in parallel',
        codeExample: `
// Before (sequential - slow)
const user = await fetch('/api/user').then(r => r.json());
const posts = await fetch('/api/posts').then(r => r.json());

// After (parallel - fast)
const [user, posts] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);
        `.trim()
      });
    }

    // Check for missing cache configuration
    if (/fetch\(/.test(code) && !/cache:|revalidate:/.test(code)) {
      optimizations.push({
        type: 'performance',
        title: 'Add fetch caching strategy',
        description: 'Configure caching to improve performance',
        priority: 'medium',
        implementation: 'Add cache or revalidate options to fetch calls',
        codeExample: `
// Static data (cached indefinitely)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});

// Revalidate every hour
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }
});

// Always fresh
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});
        `.trim()
      });
    }
  }

  private checkMetadata(code: string, filePath: string, optimizations: Optimization[]): void {
    const isLayoutOrPage = /\/(layout|page)\.(tsx|jsx)$/.test(filePath);
    
    if (isLayoutOrPage && !(/export\s+(const|async\s+function)\s+generateMetadata/.test(code))) {
      optimizations.push({
        type: 'seo',
        title: 'Add metadata for SEO',
        description: 'Export metadata to improve search engine visibility',
        priority: 'high',
        implementation: 'Add generateMetadata or metadata export',
        codeExample: `
// Static metadata
export const metadata = {
  title: 'Page Title',
  description: 'Page description for SEO',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.jpg'],
  },
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const data = await fetch(\`/api/\${params.id}\`).then(r => r.json());
  return {
    title: data.title,
    description: data.description,
  };
}
        `.trim()
      });
    }
  }

  private checkStructuredData(code: string, optimizations: Optimization[]): void {
    // Check if page could benefit from structured data
    const hasContent = /<article|<main|<section/.test(code);
    const hasStructuredData = /application\/ld\+json/.test(code);

    if (hasContent && !hasStructuredData) {
      optimizations.push({
        type: 'seo',
        title: 'Add structured data (JSON-LD)',
        description: 'Help search engines understand your content better',
        priority: 'medium',
        implementation: 'Add JSON-LD structured data script',
        codeExample: `
export default function Article({ article }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedDate,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article>{/* ... */}</article>
    </>
  );
}
        `.trim()
      });
    }
  }

  private checkAccessibility(code: string, optimizations: Optimization[]): void {
    // Check for missing alt text
    if (/<img[^>]*(?!alt=)[^>]*>/.test(code)) {
      optimizations.push({
        type: 'accessibility',
        title: 'Add alt text to images',
        description: 'Improve accessibility for screen readers',
        priority: 'high',
        implementation: 'Add descriptive alt attributes to all images'
      });
    }

    // Check for missing ARIA labels on interactive elements
    if (/<button[^>]*>(?!.*aria-label)/.test(code)) {
      optimizations.push({
        type: 'accessibility',
        title: 'Add ARIA labels to buttons',
        description: 'Ensure all interactive elements are accessible',
        priority: 'medium',
        implementation: 'Add aria-label to buttons without text content'
      });
    }

    // Check for semantic HTML
    if (/<div\s+onClick/.test(code)) {
      optimizations.push({
        type: 'accessibility',
        title: 'Use semantic HTML',
        description: 'Replace div onClick with button element',
        priority: 'high',
        implementation: 'Use <button> instead of <div onClick>',
        codeExample: `
// Before
<div onClick={handleClick}>Click me</div>

// After
<button onClick={handleClick}>Click me</button>
        `.trim()
      });
    }
  }

  private estimateImpact(optimizations: Optimization[]): ImpactEstimate {
    const highPriority = optimizations.filter(o => o.priority === 'high').length;
    const performanceOpts = optimizations.filter(o => o.type === 'performance').length;
    const bundleOpts = optimizations.filter(o => o.type === 'bundle-size').length;

    let performanceGain = 'Minimal';
    let bundleSizeReduction = 'Minimal';
    let userExperienceImprovement = 'Minor';

    if (performanceOpts >= 3) {
      performanceGain = 'Significant (20-40% faster load time)';
      userExperienceImprovement = 'Major';
    } else if (performanceOpts >= 1) {
      performanceGain = 'Moderate (10-20% faster load time)';
      userExperienceImprovement = 'Moderate';
    }

    if (bundleOpts >= 2) {
      bundleSizeReduction = 'Significant (30-50KB reduction)';
    } else if (bundleOpts >= 1) {
      bundleSizeReduction = 'Moderate (10-30KB reduction)';
    }

    if (highPriority >= 3) {
      userExperienceImprovement = 'Major';
    } else if (highPriority >= 1) {
      userExperienceImprovement = 'Moderate';
    }

    return {
      performanceGain,
      bundleSizeReduction,
      userExperienceImprovement
    };
  }
}
