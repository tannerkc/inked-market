import type { LegalDocument } from "@/lib/data/legal-types";

export const privacyPolicy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  headline: "YOUR INK, YOUR DATA",
  subtitle: "because transparency matters",
  effectiveDate: "April 1, 2026",
  version: "1.0",
  accentColor: "sage",
  sections: [
    {
      id: "what-we-collect",
      number: "01",
      title: "WHAT WE COLLECT",
      personalityIntro:
        "Every tattoo tells a story -- and so does every data point. Here's what we ask for and what we pick up along the way.",
      content: (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-3">
            (a) Information You Provide Directly
          </h3>
          <p className="mb-4">
            When you create an account or use Inked Market, you may voluntarily
            provide us with:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Account Information:</strong> Name, email address,
              password, username, and profile photo.
            </li>
            <li>
              <strong>Profile Information:</strong> Bio, specialties, years of
              experience, certifications and licenses, social media links, and
              profile images.
            </li>
            <li>
              <strong>Business Data (for studios):</strong> Studio name, address,
              phone number, operating hours, pricing information, and business
              descriptions.
            </li>
            <li>
              <strong>Portfolio Images:</strong> Photos of tattoo work uploaded
              for display on artist or studio profiles, including any associated
              tags, descriptions, and style classifications.
            </li>
            <li>
              <strong>Social Links:</strong> URLs to your Instagram, TikTok,
              website, or other social media profiles that you choose to display.
            </li>
            <li>
              <strong>Preferences:</strong> Notification settings, communication
              preferences, and display customizations.
            </li>
            <li>
              <strong>Saved Lists:</strong> Artists, studios, and portfolio images
              you bookmark or save for later reference.
            </li>
            <li>
              <strong>Reviews:</strong> Ratings, written reviews, and any photos
              included with reviews you submit.
            </li>
            <li>
              <strong>Messages:</strong> Communications sent through our
              platform messaging system between users, artists, and studios.
            </li>
            <li>
              <strong>Payment Information:</strong> When you make payments
              through the platform, payment details are collected and processed
              by Stripe. We do not store full credit card numbers, CVVs, or
              other sensitive payment credentials on our servers. We receive
              limited transaction confirmations from Stripe (last four digits,
              card brand, transaction amount, and status).
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            (b) Information Collected Automatically
          </h3>
          <p className="mb-4">
            When you access or use Inked Market, we automatically collect
            certain information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Device Information:</strong> Device type, operating system,
              browser type and version, screen resolution, and unique device
              identifiers.
            </li>
            <li>
              <strong>IP Address:</strong> Your Internet Protocol address, which
              may be used to approximate your general geographic location (city
              or region level).
            </li>
            <li>
              <strong>Log Data:</strong> Access times, pages viewed, referring
              URLs, clickstream data, and actions taken on the platform.
            </li>
            <li>
              <strong>Location Information:</strong> We collect approximate
              location from your IP address. If you grant permission, we may
              also collect precise GPS-based location data from your device to
              power &quot;near me&quot; search features. Precise geolocation is
              considered <strong>sensitive personal information</strong> under
              the California Privacy Rights Act (CPRA), and you may revoke
              consent at any time through your device settings or your Inked
              Market account preferences.
            </li>
            <li>
              <strong>Cookies & Similar Technologies:</strong> We use cookies,
              web beacons, pixels, and local storage to maintain sessions,
              remember preferences, and gather analytics data. See Section 04
              for full details.
            </li>
            <li>
              <strong>Analytics Data:</strong> Aggregated and individual usage
              patterns collected through Google Analytics and Vercel Analytics,
              including page views, session duration, and feature engagement
              metrics.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            (c) Information from Third Parties
          </h3>
          <p className="mb-4">
            We may receive information about you from third-party services you
            choose to connect:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Instagram OAuth:</strong> If you connect your Instagram
              account, we import your public profile information and, with your
              permission, portfolio photos for display on your Inked Market
              profile. Imported photos persist on our platform even if you later
              disconnect your Instagram account (you can manually delete them at
              any time).
            </li>
            <li>
              <strong>Google / Apple OAuth:</strong> If you sign in using Google
              or Apple, we receive your name, email address, and profile picture
              from the identity provider.
            </li>
            <li>
              <strong>Stripe:</strong> We receive transaction confirmations,
              payout statuses, and limited account verification data from Stripe
              for payment processing purposes.
            </li>
            <li>
              <strong>Maps & Geocoding:</strong> We use Google Maps and/or
              Mapbox to geocode studio addresses into coordinates for map display
              and proximity search. These services may receive the addresses you
              provide.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use",
      number: "02",
      title: "HOW WE USE YOUR INFORMATION",
      personalityIntro:
        "We don't collect data for the fun of it. Here's exactly what we do with it -- no hidden agendas, no fine print tricks.",
      content: (
        <>
          <p className="mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Account Management:</strong> To create and maintain your
              account, authenticate your identity, and provide customer support.
            </li>
            <li>
              <strong>Discovery Features:</strong> To power artist and studio
              search, style-based filtering, recommendations, and
              personalization so you can find the right tattoo artist for your
              next piece.
            </li>
            <li>
              <strong>Location Services:</strong> To display nearby artists and
              studios, calculate distances, render maps, and support
              radius-based search functionality.
            </li>
            <li>
              <strong>Communications:</strong> To send you service-related
              messages (booking confirmations, account updates, security
              alerts), and, with your opt-in consent, marketing and promotional
              communications.
            </li>
            <li>
              <strong>Reviews & Trust:</strong> To display verified reviews,
              maintain platform integrity, and build trust between customers,
              artists, and studios. Reviews are tied to verified bookings to
              ensure authenticity.
            </li>
            <li>
              <strong>Payment Processing:</strong> To facilitate transactions
              between customers, artists, and studios through our payment
              processor, Stripe.
            </li>
            <li>
              <strong>Analytics & Improvement:</strong> To understand how our
              platform is used, identify bugs and performance issues, measure
              feature adoption, and improve the overall user experience.
            </li>
            <li>
              <strong>Safety & Security:</strong> To detect and prevent fraud,
              abuse, spam, and other harmful activity. To enforce our Terms of
              Service and protect the rights and safety of our users.
            </li>
            <li>
              <strong>Marketing (Opt-In Only):</strong> With your explicit
              consent, to send promotional emails about new features, artist
              spotlights, and platform updates. You can opt out at any time.
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with applicable laws,
              regulations, legal processes, or governmental requests.
            </li>
          </ul>
          <p className="mb-4">
            <strong>A note about artist and studio profiles:</strong> Artist and
            studio profiles on Inked Market are semi-public by design. Profile
            information such as your name, bio, portfolio images, specialties,
            location (city level), and reviews are visible to all users of the
            platform. This visibility is core to the discovery marketplace
            functionality. See Section 15 for a detailed breakdown of public
            versus private information.
          </p>
        </>
      ),
    },
    {
      id: "how-we-share",
      number: "03",
      title: "HOW WE SHARE YOUR INFORMATION",
      personalityIntro:
        "Your data isn't a flash sheet we pass around the studio. Here's exactly who sees what, and why.",
      content: (
        <>
          <p className="mb-4">
            We share your information only in the following circumstances:
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Service Providers
          </h3>
          <p className="mb-4">
            We work with trusted third-party companies that perform services on
            our behalf. These providers are contractually obligated to use your
            data only for the purposes we specify and are bound by
            confidentiality obligations:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Stripe:</strong> Payment processing, payout management,
              and fraud detection.
            </li>
            <li>
              <strong>Vercel:</strong> Website hosting, edge delivery, and
              serverless compute.
            </li>
            <li>
              <strong>Google:</strong> Analytics, Maps/geocoding services, and
              authentication.
            </li>
            <li>
              <strong>Mapbox:</strong> Map rendering and geocoding services.
            </li>
            <li>
              <strong>Meta (Instagram):</strong> OAuth authentication and
              portfolio photo import.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Publicly Visible Information
          </h3>
          <p className="mb-4">
            Certain information you provide is displayed publicly on the
            platform as part of its core functionality. This includes artist and
            studio profile information, portfolio images, and reviews. This data
            may be indexed by search engines. See Section 15 for a complete
            breakdown.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Business Transfers
          </h3>
          <p className="mb-4">
            If Inked Market is involved in a merger, acquisition, bankruptcy,
            reorganization, or sale of assets, your information may be
            transferred as part of that transaction. We will notify you via
            email and/or a prominent notice on our platform before your
            information is transferred and becomes subject to a different
            privacy policy.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Legal Obligations
          </h3>
          <p className="mb-4">
            We may disclose your information if required to do so by law or if
            we believe in good faith that such disclosure is necessary to:
            comply with a legal obligation, court order, or subpoena; protect
            and defend the rights or property of Inked Market; prevent or
            investigate possible wrongdoing in connection with the platform;
            protect the personal safety of users or the public; or protect
            against legal liability.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">With Your Consent</h3>
          <p className="mb-4">
            We may share your information with third parties when you give us
            explicit consent to do so.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            CCPA/CPRA Disclosure
          </h3>
          <p className="mb-4">
            <strong>
              Inked Market does not sell your personal information.
            </strong>{" "}
            We do not sell, rent, or trade your personal information to third
            parties for monetary or other valuable consideration. We do not
            share your personal information for cross-context behavioral
            advertising purposes as defined under the CPRA.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      number: "04",
      title: "COOKIES & TRACKING",
      personalityIntro:
        "Not the chocolate chip kind, unfortunately. But we'll keep it just as straightforward.",
      content: (
        <>
          <p className="mb-4">
            Inked Market uses cookies and similar tracking technologies to
            operate, secure, and improve our platform. Here is what we use and
            why:
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Strictly Necessary Cookies
          </h3>
          <p className="mb-4">
            These cookies are essential for the platform to function. They
            enable core features like authentication, session management,
            security protections (CSRF tokens), and load balancing. You cannot
            opt out of these cookies because the platform will not work without
            them.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Functional Cookies
          </h3>
          <p className="mb-4">
            These cookies remember your preferences and choices -- such as dark
            mode settings, language, recently viewed profiles, and saved search
            filters -- to provide a more personalized experience. Disabling
            these cookies means the platform may not remember your preferences
            between visits.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Analytics Cookies
          </h3>
          <p className="mb-4">
            We use Google Analytics and Vercel Analytics to understand how
            visitors interact with Inked Market. These cookies collect
            information about pages visited, time on site, navigation patterns,
            and error reports. This data is aggregated and used to improve the
            platform. Google Analytics may use cookies such as{" "}
            <code>_ga</code>, <code>_ga_*</code>, and <code>_gid</code>. Vercel
            Analytics is privacy-focused and does not use cookies in most
            configurations, relying instead on anonymized server-side data
            collection.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Third-Party Cookies
          </h3>
          <p className="mb-4">
            When you connect third-party services (Instagram, Google, Apple),
            those services may set their own cookies subject to their own
            privacy policies. We do not control third-party cookies. Embedded
            maps from Google Maps or Mapbox may also set cookies for
            functionality and analytics purposes.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Managing Your Cookies
          </h3>
          <p className="mb-4">
            Most web browsers allow you to control cookies through their
            settings. You can typically find these options under
            &quot;Privacy,&quot; &quot;Security,&quot; or &quot;Cookies&quot; in
            your browser preferences. You can delete existing cookies, block all
            cookies, or configure your browser to notify you when a cookie is
            set.
          </p>
          <p className="mb-4">
            <strong>Important:</strong> Disabling or blocking cookies may impact
            your experience on Inked Market. Strictly necessary cookies cannot
            be disabled without breaking core functionality like login and
            session management. Disabling analytics cookies means we cannot
            learn from your usage to improve the platform, but it will not
            affect your ability to use the service.
          </p>
        </>
      ),
    },
    {
      id: "third-party-services",
      number: "05",
      title: "THIRD-PARTY SERVICES",
      personalityIntro:
        "We work with some solid partners to keep this studio running. Here's who they are and what they do.",
      content: (
        <>
          <p className="mb-4">
            Inked Market integrates with the following third-party services.
            Each has its own privacy policy governing the data they collect and
            process:
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Stripe</h3>
          <p className="mb-4">
            We use Stripe for all payment processing. When you make or receive
            payments through Inked Market, your payment information is collected
            and processed directly by Stripe. We do not have access to your
            full card details. Stripe may collect additional information for
            fraud prevention. Stripe&apos;s privacy policy is available at{" "}
            <strong>stripe.com/privacy</strong>.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Google Analytics</h3>
          <p className="mb-4">
            We use Google Analytics to analyze platform usage. Google Analytics
            collects data such as your IP address (anonymized where required by
            law), browser type, referring pages, pages visited, and time spent
            on pages. This information is used in aggregate to understand usage
            trends and improve the platform. You can opt out of Google Analytics
            by installing the Google Analytics Opt-Out Browser Add-on.
            Google&apos;s privacy policy is available at{" "}
            <strong>policies.google.com/privacy</strong>.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Vercel Analytics</h3>
          <p className="mb-4">
            Our platform is hosted on Vercel, and we use Vercel Analytics for
            performance monitoring and usage insights. Vercel Analytics is
            designed with privacy in mind and collects minimal data, typically
            without the use of cookies. Data collected includes page views,
            Web Vitals performance metrics, and general traffic patterns.
            Vercel&apos;s privacy policy is available at{" "}
            <strong>vercel.com/legal/privacy-policy</strong>.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Instagram / Meta OAuth
          </h3>
          <p className="mb-4">
            Artists and studios may connect their Instagram accounts to import
            portfolio photos and profile information. When you authorize this
            connection, Meta provides us with your public profile data and, if
            permitted, your media content. Key details:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Imported photos are copied to Inked Market&apos;s storage and
              persist even if you later disconnect your Instagram account. You
              can manually delete imported photos from your Inked Market profile
              at any time.
            </li>
            <li>
              We strip EXIF metadata (including GPS coordinates, camera
              information, and timestamps) from all imported images to protect
              your privacy and the privacy of the individuals depicted.
            </li>
            <li>
              Disconnecting your Instagram account revokes our ability to import
              new photos but does not automatically remove previously imported
              content.
            </li>
          </ul>
          <p className="mb-4">
            Meta&apos;s privacy policy is available at{" "}
            <strong>facebook.com/privacy/policy</strong>.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Google Maps / Mapbox
          </h3>
          <p className="mb-4">
            We use Google Maps and/or Mapbox to display studio locations on maps,
            calculate distances for &quot;near me&quot; searches, and geocode
            addresses into map coordinates. When you use map features, these
            services may collect your IP address and location data in accordance
            with their own privacy policies. Google Maps&apos; terms are
            available at <strong>cloud.google.com/maps-platform/terms</strong>.
            Mapbox&apos;s privacy policy is available at{" "}
            <strong>mapbox.com/legal/privacy</strong>.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      number: "06",
      title: "YOUR PRIVACY RIGHTS",
      personalityIntro:
        "Your body, your rules. Same goes for your data. Here's how to take control.",
      content: (
        <>
          <p className="mb-4">
            Depending on where you live, you may have specific rights regarding
            your personal information. Inked Market respects and honors the
            privacy rights granted under the following state laws:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>California Consumer Privacy Act / California Privacy Rights Act (CCPA/CPRA)</li>
            <li>Virginia Consumer Data Protection Act (VCDPA)</li>
            <li>Colorado Privacy Act (CPA)</li>
            <li>Connecticut Data Privacy Act (CTDPA)</li>
            <li>Utah Consumer Privacy Act (UCPA)</li>
            <li>Texas Data Privacy and Security Act (TDPSA)</li>
            <li>Oregon Consumer Privacy Act (OCPA)</li>
            <li>Montana Consumer Data Privacy Act (MCDPA)</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">Your Rights</h3>
          <p className="mb-4">
            Subject to applicable law, you may have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Right to Know / Access:</strong> Request that we disclose
              the categories and specific pieces of personal information we have
              collected about you, the sources of collection, the purposes for
              collection, and the categories of third parties with whom we share
              your data.
            </li>
            <li>
              <strong>Right to Delete:</strong> Request the deletion of your
              personal information, subject to certain legal exceptions (such
              as data needed for legal compliance, completing transactions, or
              fraud detection).
            </li>
            <li>
              <strong>Right to Correct:</strong> Request that we correct
              inaccurate personal information we maintain about you.
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Receive your personal
              information in a structured, commonly used, and
              machine-readable format, and transmit it to another service
              provider where technically feasible.
            </li>
            <li>
              <strong>Right to Opt-Out of Sale:</strong> Although Inked Market
              does not sell personal information, you have the right to direct
              us not to sell your personal information.
            </li>
            <li>
              <strong>Right to Opt-Out of Targeted Advertising:</strong> You
              may opt out of the processing of your personal information for
              purposes of targeted advertising.
            </li>
            <li>
              <strong>Right to Limit Use of Sensitive Personal Information:</strong>{" "}
              You may direct us to limit the use of sensitive personal
              information (such as precise geolocation) to purposes necessary
              to provide the services you request.
            </li>
            <li>
              <strong>Right to Non-Discrimination:</strong> We will not
              discriminate against you for exercising any of your privacy
              rights. We will not deny you services, charge you different
              prices, or provide a different level of quality based on your
              exercise of these rights.
            </li>
            <li>
              <strong>Right to Appeal:</strong> If we decline your privacy
              request, you have the right to appeal that decision. We will
              provide instructions on how to appeal in our response to your
              request. If your appeal is denied, you may contact your state
              attorney general&apos;s office.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            How to Exercise Your Rights
          </h3>
          <p className="mb-4">You can submit a privacy rights request by:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Emailing us at{" "}
              <strong>privacy@inkedmarket.com</strong>
            </li>
            <li>
              Submitting a request through the privacy rights web form available
              in your account settings or at our website&apos;s privacy center
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Response Timeline
          </h3>
          <p className="mb-4">
            We will acknowledge your request within 10 business days and respond
            substantively within 45 calendar days of receiving a verifiable
            request. If we need additional time, we will notify you of the
            extension and the reason, and the total response period will not
            exceed 90 calendar days.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Verification</h3>
          <p className="mb-4">
            To protect your privacy, we must verify your identity before
            fulfilling a rights request. We may ask you to confirm your email
            address, provide information matching what we have on file, or take
            other reasonable steps to verify your identity. The level of
            verification required depends on the sensitivity of the request
            (deletion requests require a higher level of verification than
            access requests).
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Authorized Agents
          </h3>
          <p className="mb-4">
            You may designate an authorized agent to submit a privacy rights
            request on your behalf. The agent must provide written authorization
            signed by you, and we may still require you to directly verify your
            identity with us. If you use an authorized agent, please have them
            email <strong>privacy@inkedmarket.com</strong> with proof of
            authorization.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Account Deletion & Reviews
          </h3>
          <p className="mb-4">
            If you request deletion of your account, reviews you have written
            will be anonymized rather than deleted. This means the review text
            and rating will remain visible but will no longer be associated with
            your name, profile, or any identifying information. This approach
            preserves the integrity of the review ecosystem while honoring your
            deletion request.
          </p>
        </>
      ),
    },
    {
      id: "data-retention",
      number: "07",
      title: "DATA RETENTION",
      personalityIntro:
        "We don't hoard your data like a tattoo magazine collection from 2003. Here's how long we keep things.",
      content: (
        <>
          <p className="mb-4">
            We retain your personal information only for as long as necessary to
            fulfill the purposes for which it was collected, or as required by
            law. Below is a summary of our retention periods:
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 pr-4 font-semibold">
                    Data Type
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Retention Period
                  </th>
                  <th className="text-left py-3 font-semibold">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Active Account Data</td>
                  <td className="py-3 pr-4">
                    Duration of account + 30 days
                  </td>
                  <td className="py-3">
                    30-day grace period allows account recovery after accidental
                    deletion
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Payment Records</td>
                  <td className="py-3 pr-4">7 years after transaction</td>
                  <td className="py-3">
                    Required by IRS regulations and financial compliance
                    obligations
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Messages</td>
                  <td className="py-3 pr-4">
                    Duration of both participants&apos; accounts
                  </td>
                  <td className="py-3">
                    Deleted when either participant deletes their account
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Reviews</td>
                  <td className="py-3 pr-4">
                    Indefinite (anonymized on account deletion)
                  </td>
                  <td className="py-3">
                    Preserves platform trust; author identity removed upon
                    request
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Analytics Data</td>
                  <td className="py-3 pr-4">26 months</td>
                  <td className="py-3">
                    Aligns with Google Analytics default retention settings
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Server Logs</td>
                  <td className="py-3 pr-4">90 days</td>
                  <td className="py-3">
                    Sufficient for debugging, security investigation, and
                    performance monitoring
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Portfolio Images</td>
                  <td className="py-3 pr-4">Until manually deleted by user</td>
                  <td className="py-3">
                    Users maintain full control over their portfolio content
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            When data reaches the end of its retention period, it is either
            permanently deleted or irreversibly anonymized. Anonymized data may
            be retained indefinitely for aggregate statistical purposes but
            cannot be used to identify any individual.
          </p>
        </>
      ),
    },
    {
      id: "data-security",
      number: "08",
      title: "DATA SECURITY",
      personalityIntro:
        "We protect your data like a fresh tattoo -- carefully, consistently, and with the right tools.",
      content: (
        <>
          <p className="mb-4">
            We implement a combination of technical, administrative, and
            organizational security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Technical Safeguards
          </h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Encryption in Transit:</strong> All data transmitted
              between your browser and our servers is encrypted using TLS
              (Transport Layer Security) via HTTPS. We enforce HSTS (HTTP
              Strict Transport Security) to prevent downgrade attacks.
            </li>
            <li>
              <strong>Encryption at Rest:</strong> Sensitive data stored in our
              databases and file storage systems is encrypted at rest using
              industry-standard AES-256 encryption.
            </li>
            <li>
              <strong>Password Security:</strong> User passwords are hashed
              using bcrypt with per-user salts. We never store passwords in
              plain text.
            </li>
            <li>
              <strong>Access Controls:</strong> We implement role-based access
              controls (RBAC) to ensure that only authorized personnel can
              access personal data, and only to the extent necessary for their
              role. Access is logged and audited.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Incident Response
          </h3>
          <p className="mb-4">
            We maintain an incident response plan for handling data breaches
            and security incidents. In the event of a breach involving your
            personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              We will notify affected users as soon as practicable, and no
              later than the timeframes required by applicable state law
              (ranging from 30 to 72 hours depending on jurisdiction).
            </li>
            <li>
              Notifications will include a description of the breach, the types
              of information involved, steps we are taking to address it, and
              recommendations for protecting yourself.
            </li>
            <li>
              We will notify relevant state attorneys general and other
              regulatory authorities as required by law.
            </li>
          </ul>

          <p className="mb-4">
            <strong>No Guarantees:</strong> While we strive to protect your
            personal information, no method of transmission over the Internet
            and no method of electronic storage is 100% secure. We cannot
            guarantee the absolute security of your information. You are
            responsible for maintaining the confidentiality of your account
            credentials and for any activity that occurs under your account.
          </p>
        </>
      ),
    },
    {
      id: "childrens-privacy",
      number: "09",
      title: "CHILDREN'S PRIVACY",
      personalityIntro:
        "This platform is for adults only -- just like the tattoo chair.",
      content: (
        <>
          <p className="mb-4">
            Inked Market is not directed at children under the age of 13, and
            we do not knowingly collect personal information from children under
            13 in compliance with the Children&apos;s Online Privacy Protection
            Act (COPPA).
          </p>
          <p className="mb-4">
            <strong>Platform Minimum Age:</strong> The minimum age to create an
            account on Inked Market is 18 years old. This aligns with the
            minimum legal age for getting a tattoo in most U.S. jurisdictions
            and reflects the nature of our platform as a marketplace connecting
            adults with professional tattoo services.
          </p>
          <p className="mb-4">
            <strong>California Residents Ages 13-15:</strong> Under the CPRA,
            we do not sell or share personal information of consumers we know
            to be under 16 years of age unless we receive affirmative
            authorization (opt-in) from the consumer (for consumers ages 13-15)
            or from a parent or guardian (for consumers under 13). Because our
            platform requires users to be 18 or older, this provision is
            addressed by our age restriction policy.
          </p>
          <p className="mb-4">
            If we discover that we have collected personal information from a
            child under the age of 13, or from anyone under the age of 18 in
            violation of our Terms of Service, we will promptly delete that
            information. If you believe that a child has provided us with
            personal information, please contact us at{" "}
            <strong>privacy@inkedmarket.com</strong> so that we can take
            appropriate action.
          </p>
        </>
      ),
    },
    {
      id: "international",
      number: "10",
      title: "INTERNATIONAL DATA",
      personalityIntro:
        "We're based in the US, but great tattoo art knows no borders.",
      content: (
        <>
          <p className="mb-4">
            Inked Market is operated in the United States, and all personal
            information we collect is stored and processed on servers located
            in the United States. Our hosting provider, Vercel, may utilize edge
            network locations globally for performance optimization, but primary
            data storage remains in the United States.
          </p>
          <p className="mb-4">
            If you are accessing Inked Market from outside the United States,
            please be aware that your personal information will be transferred
            to, stored in, and processed in the United States. Data protection
            laws in the United States may differ from the laws in your country
            of residence, and may not offer the same level of protection.
          </p>
          <p className="mb-4">
            By using Inked Market, you consent to the transfer of your personal
            information to the United States and the processing of your data in
            accordance with this Privacy Policy. If you do not consent to such
            transfer and processing, please do not use our platform.
          </p>
          <p className="mb-4">
            We do not currently offer services specifically directed at
            residents of the European Economic Area (EEA), the United Kingdom,
            or other jurisdictions with comprehensive data protection
            frameworks such as the GDPR. If we expand our services to those
            regions in the future, we will update this Privacy Policy to
            address applicable legal requirements, including lawful bases for
            processing, international transfer mechanisms, and additional
            rights.
          </p>
        </>
      ),
    },
    {
      id: "policy-changes",
      number: "11",
      title: "CHANGES TO THIS POLICY",
      personalityIntro:
        "Policies evolve -- just like tattoo styles. We'll always keep you in the loop.",
      content: (
        <>
          <p className="mb-4">
            We reserve the right to update or modify this Privacy Policy at any
            time to reflect changes in our practices, technologies, legal
            requirements, or other factors. When we make changes, we will
            update the &quot;Effective Date&quot; at the top of this policy and
            the version number.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Material Changes
          </h3>
          <p className="mb-4">
            For material changes that significantly affect how we collect, use,
            or share your personal information, we will provide enhanced notice
            through one or more of the following methods:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              An email notification sent to the address associated with your
              account
            </li>
            <li>A prominent notice displayed on the Inked Market website</li>
            <li>
              An in-app notification upon your next login
            </li>
          </ul>
          <p className="mb-4">
            We will provide at least <strong>30 days&apos; advance notice</strong>{" "}
            before material changes take effect, giving you time to review the
            updated policy and make informed choices about your continued use of
            the platform.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Non-Material Changes
          </h3>
          <p className="mb-4">
            For minor or non-material changes (such as clarifications,
            formatting updates, or corrections), we may update the policy
            without prior notice. The updated effective date will always reflect
            the most recent revision.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Annual Review</h3>
          <p className="mb-4">
            In compliance with the CCPA/CPRA, we review and update this Privacy
            Policy at least annually to ensure it accurately describes our data
            practices. Your continued use of Inked Market after the effective
            date of a revised policy constitutes your acceptance of the updated
            terms.
          </p>
        </>
      ),
    },
    {
      id: "do-not-track",
      number: "12",
      title: "DO NOT TRACK & GLOBAL PRIVACY CONTROL",
      personalityIntro:
        "If your browser says 'back off,' we listen.",
      content: (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-3">
            Global Privacy Control (GPC)
          </h3>
          <p className="mb-4">
            Inked Market honors Global Privacy Control (GPC) signals. If your
            browser or device sends a GPC signal, we will treat it as a valid
            request to opt out of the sale or sharing of your personal
            information, as required by the California Privacy Rights Act
            (CPRA) and the Colorado Privacy Act (CPA). When we detect a GPC
            signal, we will automatically suppress any data sharing that would
            constitute a &quot;sale&quot; or &quot;sharing&quot; under these
            laws for that browsing session.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Do Not Track (DNT)
          </h3>
          <p className="mb-4">
            The California Online Privacy Protection Act (CalOPPA) requires us
            to disclose how we respond to Do Not Track (DNT) signals. At this
            time, there is no universally accepted standard for how online
            services should respond to DNT browser signals. While we respect
            your privacy preferences, we primarily rely on the GPC standard as
            a more clearly defined and legally recognized opt-out mechanism.
            When a DNT signal is received without an accompanying GPC signal,
            our analytics and functional cookies may still operate, but we will
            not use any data collected during that session for targeted
            advertising purposes.
          </p>
        </>
      ),
    },
    {
      id: "shine-the-light",
      number: "13",
      title: "CALIFORNIA SHINE THE LIGHT",
      personalityIntro:
        "California, you get your own spotlight. Fitting for the state that brought us so much tattoo culture.",
      content: (
        <>
          <p className="mb-4">
            Under California Civil Code Section 1798.83, also known as the
            &quot;Shine the Light&quot; law, California residents who provide
            personal information to a business with which they have established
            a business relationship may request information about whether the
            business has disclosed personal information to any third parties
            for the third parties&apos; direct marketing purposes.
          </p>
          <p className="mb-4">
            <strong>
              Inked Market does not share your personal information with third
              parties for their direct marketing purposes.
            </strong>
          </p>
          <p className="mb-4">
            If you are a California resident and would like to make a Shine the
            Light request, you may submit one request per calendar year by
            contacting us at <strong>privacy@inkedmarket.com</strong> with the
            subject line &quot;California Shine the Light Request.&quot; Please
            include your name, mailing address, and a statement that you are a
            California resident. We will respond within 30 days.
          </p>
        </>
      ),
    },
    {
      id: "portfolio-consent",
      number: "14",
      title: "PORTFOLIO IMAGES & THIRD-PARTY CONSENT",
      personalityIntro:
        "The art lives on skin, but the photos live on servers. Let's talk about who's in those photos.",
      content: (
        <>
          <p className="mb-4">
            Portfolio images are central to the Inked Market experience. These
            images typically depict tattoo artwork on the bodies of clients and
            may include identifiable features. We take the following measures to
            protect the privacy of all individuals depicted:
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Artist Responsibilities
          </h3>
          <p className="mb-4">
            Artists and studios who upload portfolio images are responsible for
            obtaining appropriate consent from the individuals depicted in those
            images. By uploading a portfolio image to Inked Market, you
            represent and warrant that:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              You have obtained consent from any identifiable individuals
              depicted in the image to display it publicly on a digital
              platform.
            </li>
            <li>
              The image does not violate any copyright, trademark, or other
              intellectual property rights of any third party.
            </li>
            <li>
              You have the right to upload and display the image on Inked
              Market.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Model Releases
          </h3>
          <p className="mb-4">
            We strongly recommend that artists and studios obtain written model
            releases from their clients before photographing and uploading
            tattoo work. While not legally required in all jurisdictions for
            portfolio purposes, a model release provides clear documentation of
            consent and protects both the artist and the depicted individual.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Takedown Requests
          </h3>
          <p className="mb-4">
            If you are depicted in a portfolio image on Inked Market and did
            not consent to its publication, or if you wish to revoke your
            consent, you may submit a takedown request to{" "}
            <strong>privacy@inkedmarket.com</strong>. Please include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>A link to or description of the image in question</li>
            <li>
              An explanation of your relationship to the image (you are the
              person depicted, or you are acting on behalf of the person
              depicted)
            </li>
            <li>Your contact information for verification</li>
          </ul>
          <p className="mb-4">
            We will investigate takedown requests promptly and, if warranted,
            remove the image within a reasonable timeframe, typically within 5
            business days.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            EXIF Metadata Stripping
          </h3>
          <p className="mb-4">
            All images uploaded to Inked Market -- whether directly or imported
            from Instagram -- are automatically processed to strip EXIF
            metadata. This includes GPS coordinates, camera and device
            information, timestamps, and other embedded data. This measure
            protects the location privacy of both artists and the individuals
            depicted in portfolio images.
          </p>
        </>
      ),
    },
    {
      id: "public-private",
      number: "15",
      title: "PUBLIC VS. PRIVATE INFORMATION",
      personalityIntro:
        "Some things go on the wall, some things stay in the back room. Here's which is which.",
      content: (
        <>
          <p className="mb-4">
            Inked Market is a discovery platform, and certain information is
            public by design to enable its core functionality. Here is a
            breakdown of what is publicly visible and what remains private:
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 pr-4 font-semibold">
                    Information
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Visibility
                  </th>
                  <th className="text-left py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Artist / Studio Name</td>
                  <td className="py-3 pr-4">Public</td>
                  <td className="py-3">Displayed on profile and in search results</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Profile Bio & Specialties</td>
                  <td className="py-3 pr-4">Public</td>
                  <td className="py-3">Visible on profile pages</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Portfolio Images</td>
                  <td className="py-3 pr-4">Public</td>
                  <td className="py-3">Core to discovery; EXIF data stripped</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Reviews & Ratings</td>
                  <td className="py-3 pr-4">Public</td>
                  <td className="py-3">Reviewer name visible; anonymized on account deletion</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Studio Location (City / Address)</td>
                  <td className="py-3 pr-4">Public</td>
                  <td className="py-3">Necessary for discovery and map features</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Social Media Links</td>
                  <td className="py-3 pr-4">Public</td>
                  <td className="py-3">Only links you choose to add</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Email Address</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Never displayed publicly; used for account management</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Password</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Hashed and salted; never accessible</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Precise GPS Location</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Used for proximity search only; never shared or displayed</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Payment & Financial Data</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Processed by Stripe; we never see full card numbers</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Customer Preferences & Saved Lists</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Visible only to the account owner</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">Messages</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Visible only to conversation participants</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 pr-4">IP Address & Device Info</td>
                  <td className="py-3 pr-4">Private</td>
                  <td className="py-3">Collected for security and analytics; never displayed</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            You can control what appears on your profile by editing your
            profile settings. However, certain information (such as your name
            and portfolio) is inherently public on a discovery marketplace and
            cannot be hidden while maintaining an active profile. If you wish
            to remove all public information, you may deactivate or delete your
            account.
          </p>
        </>
      ),
    },
    {
      id: "can-spam",
      number: "16",
      title: "EMAIL COMMUNICATIONS",
      personalityIntro:
        "We'll never flood your inbox. When we send something, it's worth reading.",
      content: (
        <>
          <p className="mb-4">
            Inked Market complies with the CAN-SPAM Act of 2003 and applicable
            state email marketing laws. Here is how we handle email
            communications:
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Transactional Emails
          </h3>
          <p className="mb-4">
            These are emails necessary for the operation of your account and
            the services you have requested. They include account verification,
            password resets, booking confirmations, payment receipts, security
            alerts, and privacy rights request responses. You cannot opt out of
            transactional emails while maintaining an active account, as they
            are essential to the service.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Marketing Emails</h3>
          <p className="mb-4">
            With your explicit opt-in consent, we may send marketing emails
            including new feature announcements, artist spotlights, platform
            updates, and promotional offers. Every marketing email will:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Clearly identify Inked Market as the sender
            </li>
            <li>
              Include our physical mailing address (as required by CAN-SPAM)
            </li>
            <li>
              Include a clear and conspicuous unsubscribe mechanism
            </li>
            <li>
              Use accurate subject lines that are not deceptive or misleading
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3">Unsubscribing</h3>
          <p className="mb-4">
            You can unsubscribe from marketing emails at any time by clicking
            the &quot;unsubscribe&quot; link at the bottom of any marketing
            email, or by adjusting your notification preferences in your
            account settings. We will honor your unsubscribe request within 10
            business days. Once unsubscribed, you will continue to receive
            transactional emails related to your account activity.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            Physical Address
          </h3>
          <p className="mb-4">
            As required by the CAN-SPAM Act, all marketing emails will include
            our valid physical mailing address. Our current mailing address is
            included in the footer of every marketing email we send and is also
            available in Section 17 of this Privacy Policy.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      number: "17",
      title: "CONTACT US",
      personalityIntro:
        "Got questions? We're all ears. Reach out anytime -- no appointment necessary.",
      content: (
        <>
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or our data practices, you can reach us through the
            following channels:
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Email</h3>
          <p className="mb-4">
            <strong>privacy@inkedmarket.com</strong>
            <br />
            For all privacy-related inquiries, data rights requests, takedown
            requests, and general questions about how we handle your
            information.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Mailing Address</h3>
          <p className="mb-4">
            Inked Market
            <br />
            Attn: Privacy Team
            <br />
            Mailing address will be published here once the entity is formally
            incorporated. In the interim, please direct all correspondence to{" "}
            <strong>privacy@inkedmarket.com</strong>.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Web Form</h3>
          <p className="mb-4">
            A privacy rights request form is available in your account settings
            and at our website&apos;s privacy center. This form allows you to
            submit access, deletion, correction, and opt-out requests directly.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">
            &quot;Do Not Sell or Share My Personal Information&quot;
          </h3>
          <p className="mb-4">
            While Inked Market does not sell or share personal information for
            cross-context behavioral advertising, we provide a &quot;Do Not
            Sell or Share My Personal Information&quot; link accessible from
            the footer of every page on our website, as required by the CPRA.
            Clicking this link will allow you to exercise your opt-out rights.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3">Response Times</h3>
          <p className="mb-4">
            We aim to respond to all privacy inquiries within 5 business days.
            Formal data rights requests will be acknowledged within 10 business
            days and fulfilled within 45 calendar days, as described in Section
            06.
          </p>
        </>
      ),
    },
  ],
};
