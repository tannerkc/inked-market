import type {
  HelpArticle,
  HelpSearchSuggestion,
} from "@/lib/data/help-types";

export const helpArticles: HelpArticle[] = [
  /* ── Getting Started ───────────────────────── */
  {
    slug: "creating-your-account",
    title: "Creating Your Account",
    headline: "CREATE YOUR ACCOUNT",
    subtitle: "get started in under a minute",
    format: "guide",
    audiences: ["customer", "artist", "studio-owner"],
    categorySlug: "getting-started",
    accentColor: "sage",
    tags: ["account", "signup", "onboarding"],
    popularOrder: 5,
    sections: [
      {
        id: "sign-up",
        number: "01",
        title: "SIGN UP",
        personalityIntro:
          "Whether you're here to find your next tattoo or showcase your work, it all starts with an account.",
        content: (
          <>
            <p>
              Head to <strong>inkedmarket.com</strong> and click{" "}
              <strong>Get Started</strong>. You can sign up with your email
              address, or use Google or Apple for one-click access.
            </p>
            <h3>What you&apos;ll need</h3>
            <ul>
              <li>A valid email address</li>
              <li>A password (at least 8 characters)</li>
              <li>Your name (display name can be changed later)</li>
            </ul>
          </>
        ),
      },
      {
        id: "choose-your-role",
        number: "02",
        title: "CHOOSE YOUR ROLE",
        content: (
          <>
            <p>
              After signing up, you&apos;ll be asked how you want to use Inked
              Market:
            </p>
            <ul>
              <li>
                <strong>Customer</strong> &mdash; Browse artists, save
                favorites, book appointments
              </li>
              <li>
                <strong>Artist</strong> &mdash; Build your portfolio, manage
                bookings, connect with clients
              </li>
              <li>
                <strong>Studio Owner</strong> &mdash; Claim your studio, manage your
                team, grow your presence
              </li>
            </ul>
            <p>
              You can always change your role or add additional roles from your
              account settings later.
            </p>
          </>
        ),
      },
      {
        id: "complete-your-profile",
        number: "03",
        title: "COMPLETE YOUR PROFILE",
        content: (
          <>
            <p>
              A complete profile helps you get discovered (for artists and studios)
              or get personalized recommendations (for customers).
            </p>
            <h3>For customers</h3>
            <ul>
              <li>Add your location for nearby artist suggestions</li>
              <li>Select your preferred tattoo styles</li>
            </ul>
            <h3>For artists</h3>
            <ul>
              <li>Upload portfolio images (or import from Instagram)</li>
              <li>Tag your specialties from the 15 style categories</li>
              <li>Add your studio affiliation (if applicable)</li>
            </ul>
          </>
        ),
      },
    ],
  },

  /* ── For Artists ────────────────────────────── */
  {
    slug: "uploading-your-portfolio",
    title: "Uploading Your Portfolio",
    headline: "UPLOADING YOUR PORTFOLIO",
    subtitle: "showcase your best work",
    format: "guide",
    audiences: ["artist"],
    categorySlug: "for-artists",
    accentColor: "red",
    tags: ["portfolio", "images", "upload"],
    popularOrder: 4,
    sections: [
      {
        id: "image-requirements",
        number: "01",
        title: "IMAGE REQUIREMENTS",
        personalityIntro:
          "Your portfolio is your storefront. High-quality images make the difference between a scroll-past and a booking.",
        content: (
          <>
            <h3>Supported formats</h3>
            <ul>
              <li>
                <strong>JPEG, PNG, WebP</strong> &mdash; up to 10MB per image
              </li>
              <li>Minimum resolution: 1200 x 1200 pixels</li>
              <li>Square or portrait orientation recommended</li>
            </ul>
            <h3>Tips for great portfolio photos</h3>
            <ul>
              <li>Photograph fresh tattoos (healed is fine too)</li>
              <li>Use natural or studio lighting &mdash; avoid harsh flash</li>
              <li>
                Crop to focus on the tattoo, minimize background distractions
              </li>
              <li>Include a mix of styles if you specialize in multiple</li>
            </ul>
          </>
        ),
      },
      {
        id: "upload-methods",
        number: "02",
        title: "UPLOAD METHODS",
        content: (
          <>
            <h3>Direct upload</h3>
            <p>
              Drag and drop images from your device, or click to browse. You can
              upload up to 20 images at once. Each image will be automatically
              optimized for web display.
            </p>
            <h3>Instagram import</h3>
            <p>
              Connect your Instagram account for one-click portfolio import.
              We&apos;ll pull your most recent posts and let you select which
              ones to include. Future posts can be auto-synced.
            </p>
          </>
        ),
      },
      {
        id: "style-tagging",
        number: "03",
        title: "STYLE TAGGING",
        content: (
          <>
            <p>
              After uploading, tag each image with one or more of the 15 tattoo
              styles. This powers the discovery engine &mdash; customers search
              by style, so accurate tags mean more visibility.
            </p>
            <ul>
              <li>Traditional, Realism, Watercolor, Tribal, Geometric</li>
              <li>Blackwork, Japanese, Minimalist, Portrait, Fine-line</li>
              <li>Neo-traditional, Dotwork, Sketch, Abstract, Other</li>
            </ul>
            <p>
              Pro tip: Let our AI suggest styles based on your image. You can
              accept or adjust the suggestions.
            </p>
          </>
        ),
      },
    ],
  },

  /* ── For Artists FAQ ────────────────────────── */
  {
    slug: "artist-faq",
    title: "Artist FAQ",
    headline: "ARTIST FAQ",
    subtitle: "quick answers for artists",
    format: "faq",
    audiences: ["artist"],
    categorySlug: "for-artists",
    accentColor: "red",
    tags: ["faq", "artists", "common-questions"],
    faqItems: [
      {
        id: "image-formats",
        question: "What image formats are supported?",
        audiences: ["artist"],
        answer: (
          <p>
            We support JPEG, PNG, and WebP up to 10MB per image. Minimum
            resolution is 1200 x 1200 pixels. Images are automatically optimized
            for web display after upload.
          </p>
        ),
      },
      {
        id: "multiple-studios",
        question: "Can I be listed at multiple studios?",
        audiences: ["artist"],
        answer: (
          <p>
            Yes. Your artist profile exists independently of any studio. You can be
            affiliated with multiple studios (e.g., your home studio plus guest
            spots). Each studio listing will show you as one of their artists.
          </p>
        ),
      },
      {
        id: "instagram-sync",
        question: "How does Instagram import work?",
        audiences: ["artist"],
        answer: (
          <>
            <p>
              Connect your Instagram account via OAuth. We&apos;ll pull your
              recent posts and let you select which ones to add to your
              portfolio. You can enable auto-sync to keep your portfolio
              up-to-date as you post new work.
            </p>
            <p>
              Instagram import doesn&apos;t give us access to your DMs, follower
              list, or any private data.
            </p>
          </>
        ),
      },
      {
        id: "style-tags",
        question: "How do style tags work?",
        audiences: ["artist"],
        answer: (
          <p>
            Inked Market uses 15 standardized style categories. When you upload
            portfolio images, you tag each with one or more styles. These tags
            power the discovery engine so customers searching for
            &ldquo;watercolor&rdquo; or &ldquo;geometric&rdquo; can find your
            work. Our AI can also suggest tags based on the image.
          </p>
        ),
      },
    ],
  },

  /* ── For Studio Owners ──────────────────────── */
  {
    slug: "claiming-your-studio",
    title: "Claiming Your Studio",
    headline: "CLAIMING YOUR STUDIO",
    subtitle: "take ownership of your listing",
    format: "guide",
    audiences: ["studio-owner"],
    categorySlug: "for-studio-owners",
    accentColor: "rust",
    tags: ["studio", "claim", "onboarding"],
    popularOrder: 3,
    sections: [
      {
        id: "find-your-studio",
        number: "01",
        title: "FIND YOUR STUDIO",
        personalityIntro:
          "Your studio might already be on Inked Market. We pull from public directories so customers can discover you even before you claim your listing.",
        content: (
          <>
            <p>
              Search for your studio name on the Discover page. If we&apos;ve
              already created a listing from public data, you&apos;ll see a{" "}
              <strong>&ldquo;Claim this studio&rdquo;</strong> button on the
              profile page.
            </p>
            <p>
              If your studio isn&apos;t listed yet, click{" "}
              <strong>&ldquo;Add Your Studio&rdquo;</strong> from your dashboard to
              create a new listing from scratch.
            </p>
          </>
        ),
      },
      {
        id: "verify-ownership",
        number: "02",
        title: "VERIFY OWNERSHIP",
        content: (
          <>
            <p>
              To protect studios from unauthorized claims, we verify ownership
              through one of these methods:
            </p>
            <ul>
              <li>
                <strong>Phone verification</strong> &mdash; We call the business
                phone number on file with a verification code
              </li>
              <li>
                <strong>Email verification</strong> &mdash; Confirm via the
                email address on your Google Business listing
              </li>
              <li>
                <strong>Document upload</strong> &mdash; Upload a business
                license or utility bill matching the studio address
              </li>
            </ul>
            <p>Verification typically completes within 24&ndash;48 hours.</p>
          </>
        ),
      },
      {
        id: "customize-your-listing",
        number: "03",
        title: "CUSTOMIZE YOUR LISTING",
        content: (
          <>
            <p>
              Once verified, you have full control over your studio&apos;s
              presence:
            </p>
            <ul>
              <li>Upload a cover photo and logo</li>
              <li>Write your studio&apos;s story and description</li>
              <li>Add your artists and their portfolios</li>
              <li>Set your hours, location, and contact info</li>
              <li>Enable booking integrations</li>
              <li>Embed widgets on your existing website</li>
            </ul>
          </>
        ),
      },
    ],
  },

  /* ── For Studio Owners FAQ ──────────────────── */
  {
    slug: "studio-owner-faq",
    title: "Studio Owner FAQ",
    headline: "STUDIO OWNER FAQ",
    subtitle: "quick answers for studio owners",
    format: "faq",
    audiences: ["studio-owner"],
    categorySlug: "for-studio-owners",
    accentColor: "rust",
    tags: ["faq", "studios", "common-questions"],
    faqItems: [
      {
        id: "add-artists",
        question: "How do I add artists to my studio?",
        audiences: ["studio-owner"],
        answer: (
          <p>
            From your studio dashboard, go to <strong>Team</strong> and click{" "}
            <strong>Invite Artist</strong>. Enter their email and they&apos;ll
            receive an invitation to join your studio. Artists who already have an
            Inked Market profile will be linked automatically.
          </p>
        ),
      },
      {
        id: "website-builder",
        question: "How does the website builder work?",
        audiences: ["studio-owner"],
        answer: (
          <>
            <p>
              The website builder lets you create a simple, branded web page for
              your studio using the information already on your Inked Market
              profile. Choose a template, customize colors and layout, and
              publish to a yourstudio.inkedmarket.com subdomain.
            </p>
            <p>
              You can also use a custom domain if you already own one.
            </p>
          </>
        ),
      },
      {
        id: "embed-widgets",
        question: "Can I embed booking widgets on my existing site?",
        audiences: ["studio-owner"],
        answer: (
          <p>
            Yes. We provide embeddable widgets that work with Squarespace, Wix,
            WordPress, and any site that supports custom HTML. Copy the embed
            code from your dashboard and paste it into your site. The widget
            shows a &ldquo;Book via Inked Market&rdquo; button styled to match
            your brand.
          </p>
        ),
      },
    ],
  },

  /* ── Discovery & Booking ───────────────────── */
  {
    slug: "finding-artists-near-you",
    title: "Finding Artists Near You",
    headline: "FINDING ARTISTS NEAR YOU",
    subtitle: "discover your perfect match",
    format: "guide",
    audiences: ["customer"],
    categorySlug: "discovery-and-booking",
    accentColor: "sage",
    tags: ["search", "discovery", "location"],
    popularOrder: 2,
    sections: [
      {
        id: "search-and-filter",
        number: "01",
        title: "SEARCH & FILTER",
        personalityIntro:
          "Finding the right artist is personal. Our search is built to help you narrow down by style, location, rating, and more.",
        content: (
          <>
            <p>
              Use the <strong>Discover</strong> page to search by style, city,
              or vibe. The filter bar lets you combine criteria:
            </p>
            <ul>
              <li>
                <strong>Style</strong> &mdash; Select one or more of 15 tattoo
                styles
              </li>
              <li>
                <strong>Location</strong> &mdash; Search by city or enable GPS
                for nearby results
              </li>
              <li>
                <strong>Rating</strong> &mdash; Filter by minimum rating
                (3.0&ndash;4.8+)
              </li>
              <li>
                <strong>Verified</strong> &mdash; Show only verified artists
              </li>
              <li>
                <strong>Walk-ins</strong> &mdash; Show artists accepting
                walk-ins today
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "comparing-artists",
        number: "02",
        title: "COMPARING ARTISTS",
        content: (
          <>
            <p>
              Click any artist card to view their full profile with portfolio,
              reviews, and booking availability. Save artists to your favorites
              list to compare later.
            </p>
            <p>
              Pay attention to the <strong>verified badge</strong> &mdash; it
              means the artist&apos;s identity and work have been confirmed by
              our team.
            </p>
          </>
        ),
      },
    ],
  },

  /* ── Trust & Safety ────────────────────────── */
  {
    slug: "how-verification-works",
    title: "How Verification Works",
    headline: "HOW VERIFICATION WORKS",
    subtitle: "trust, earned and verified",
    format: "guide",
    audiences: ["customer", "artist", "studio-owner"],
    categorySlug: "trust-and-safety",
    accentColor: "red",
    tags: ["verification", "trust", "safety"],
    popularOrder: 1,
    sections: [
      {
        id: "what-is-verification",
        number: "01",
        title: "WHAT IS VERIFICATION",
        personalityIntro:
          "The verified badge isn't decoration — it's a promise. Here's how we earn your trust.",
        content: (
          <>
            <p>
              Verification on Inked Market means we&apos;ve confirmed that an
              artist or studio is who they claim to be. The green badge appears on
              profiles that have passed our verification process.
            </p>
            <h3>What we verify</h3>
            <ul>
              <li>Identity (government ID or professional license)</li>
              <li>Portfolio authenticity (original work confirmation)</li>
              <li>
                Studio legitimacy (business license, physical location)
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "verified-reviews",
        number: "02",
        title: "VERIFIED REVIEWS",
        content: (
          <>
            <p>
              Reviews on Inked Market are <strong>verified-booking only</strong>.
              This means you can only leave a review if you booked through the
              platform or had your appointment confirmed by the artist.
            </p>
            <p>
              This prevents fake reviews and ensures every rating reflects a real
              experience. Think of it like Airbnb &mdash; only guests who stayed
              can review.
            </p>
          </>
        ),
      },
    ],
  },

  /* ── Account & Settings FAQ ────────────────── */
  {
    slug: "account-faq",
    title: "Account & Settings FAQ",
    headline: "ACCOUNT & SETTINGS",
    subtitle: "manage your account",
    format: "faq",
    audiences: ["customer", "artist", "studio-owner"],
    categorySlug: "account-and-settings",
    accentColor: "rust",
    tags: ["account", "settings", "privacy"],
    faqItems: [
      {
        id: "change-email",
        question: "How do I change my email address?",
        audiences: ["customer", "artist", "studio-owner"],
        answer: (
          <p>
            Go to <strong>Settings &gt; Account</strong> and click{" "}
            <strong>Change Email</strong>. You&apos;ll need to verify the new
            address before the change takes effect.
          </p>
        ),
      },
      {
        id: "delete-account",
        question: "Can I delete my account?",
        audiences: ["customer", "artist", "studio-owner"],
        answer: (
          <>
            <p>
              Yes. Go to <strong>Settings &gt; Account &gt; Delete Account</strong>.
              This permanently removes your profile, portfolio, reviews, and all
              associated data. This action cannot be undone.
            </p>
            <p>
              If you&apos;re a studio owner, make sure to transfer ownership or
              remove your studio listing before deleting your account.
            </p>
          </>
        ),
      },
      {
        id: "notifications",
        question: "How do I manage notifications?",
        audiences: ["customer", "artist", "studio-owner"],
        answer: (
          <p>
            Go to <strong>Settings &gt; Notifications</strong>. You can toggle
            email and push notifications independently for bookings, messages,
            reviews, and marketing updates.
          </p>
        ),
      },
      {
        id: "privacy-settings",
        question: "What privacy controls are available?",
        audiences: ["customer", "artist", "studio-owner"],
        answer: (
          <>
            <p>You control who sees what:</p>
            <ul>
              <li>
                <strong>Profile visibility</strong> &mdash; Public or unlisted
              </li>
              <li>
                <strong>Location sharing</strong> &mdash; Exact, approximate, or
                hidden
              </li>
              <li>
                <strong>Saved lists</strong> &mdash; Private by default
              </li>
              <li>
                <strong>Review visibility</strong> &mdash; Reviews you write are
                always public (with your display name)
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
];

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return helpArticles.filter((a) => a.categorySlug === categorySlug);
}

export function getArticle(
  categorySlug: string,
  articleSlug: string
): HelpArticle | undefined {
  return helpArticles.find(
    (a) => a.categorySlug === categorySlug && a.slug === articleSlug
  );
}

export function getPopularArticles(limit = 8): HelpArticle[] {
  return helpArticles
    .filter((a) => a.popularOrder != null)
    .sort((a, b) => (a.popularOrder ?? 99) - (b.popularOrder ?? 99))
    .slice(0, limit);
}

export function searchSuggestions(query: string): HelpSearchSuggestion[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();

  const suggestions: HelpSearchSuggestion[] = [];

  for (const article of helpArticles) {
    const matchesTitle = article.title.toLowerCase().includes(q);
    const matchesTags = article.tags.some((t) => t.includes(q));

    if (matchesTitle || matchesTags) {
      const articleAudience = article.audiences[0];
      if (articleAudience) {
        suggestions.push({
          title: article.title,
          href: `/help/${article.categorySlug}/${article.slug}`,
          audience: articleAudience,
          format: article.format,
        });
      }
    }

    if (article.faqItems) {
      for (const faq of article.faqItems) {
        if (faq.question.toLowerCase().includes(q)) {
          const faqAudience = faq.audiences[0];
          if (faqAudience) {
            suggestions.push({
              title: faq.question,
              href: `/help/${article.categorySlug}/${article.slug}#${faq.id}`,
              audience: faqAudience,
              format: "faq",
            });
          }
        }
      }
    }
  }

  return suggestions.slice(0, 8);
}
