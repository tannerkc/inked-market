import type { LegalDocument } from "@/lib/data/legal-types";

export const termsOfService: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  headline: "THE HOUSE RULES",
  subtitle: "read before you get inked",
  effectiveDate: "April 1, 2026",
  version: "1.0",
  accentColor: "rust",
  sections: [
    {
      id: "acceptance",
      number: "01",
      title: "ACCEPTANCE OF TERMS",
      personalityIntro:
        "Walk through the door, you agree to the vibe. No exceptions.",
      content: (
        <>
          <p>
            By accessing, browsing, or using the Inked Market platform (the
            &quot;Platform&quot;), including any associated websites, mobile
            applications, APIs, and services (collectively, the
            &quot;Services&quot;), you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service (the
            &quot;Terms&quot;). If you do not agree to these Terms, you must
            immediately cease all use of the Platform.
          </p>

          <h3>Browsing</h3>
          <p>
            Your continued use of the Platform, even without creating an
            account, constitutes acceptance of these Terms and our Privacy
            Policy. Browsing, searching, or viewing any content on the Platform
            means you are bound by these Terms.
          </p>

          <h3>Account Creation</h3>
          <p>
            By creating an account on Inked Market, you explicitly and
            affirmatively agree to these Terms. During registration, you will be
            required to acknowledge your acceptance before your account is
            activated.
          </p>

          <h3>Age Requirement</h3>
          <p>
            You must be at least eighteen (18) years of age to use the Platform.
            By using the Services, you represent and warrant that you are at
            least 18 years old and have the legal capacity to enter into a
            binding agreement. If you are under 18, you may not use the Platform
            under any circumstances.
          </p>

          <h3>Capacity and Authority</h3>
          <p>
            You represent that you have the legal capacity to enter into these
            Terms. If you are using the Platform on behalf of an organization,
            such as a tattoo studio or business entity, you represent and
            warrant that you have the authority to bind that organization to
            these Terms. The term &quot;you&quot; will then refer to both you
            individually and the organization you represent.
          </p>

          <h3>Disagreement</h3>
          <p>
            If you do not agree with any part of these Terms, your sole remedy
            is to stop using the Platform and, if applicable, delete your
            account. Continued use after any modification to these Terms
            constitutes acceptance of the modified Terms.
          </p>
        </>
      ),
    },
    {
      id: "description",
      number: "02",
      title: "DESCRIPTION OF SERVICE",
      personalityIntro:
        "We build the bridge between you and your next tattoo artist. We don't hold the needle.",
      content: (
        <>
          <p>
            Inked Market is a tattoo studio and artist discovery marketplace that
            connects tattoo artists, tattoo studios, and customers seeking tattoo
            services (the &quot;Services&quot;). The Platform facilitates
            discovery, portfolio browsing, and communication between these
            parties.
          </p>

          <h3>What Inked Market Is</h3>
          <ul>
            <li>
              A marketplace and intermediary connecting tattoo artists and studios
              with potential customers
            </li>
            <li>
              A discovery platform for browsing artist portfolios, styles,
              locations, and reviews
            </li>
            <li>
              A technology platform that may integrate with third-party booking,
              payment, and social media services
            </li>
            <li>
              A directory and profile hosting service for tattoo professionals
            </li>
          </ul>

          <h3>What Inked Market Is Not</h3>
          <ul>
            <li>
              Inked Market does <strong>not</strong> provide tattoo services,
              body art, or any form of body modification
            </li>
            <li>
              Inked Market does <strong>not</strong> employ, contract, or
              supervise any tattoo artists or studio operators listed on the
              Platform
            </li>
            <li>
              Inked Market does <strong>not</strong> guarantee the quality,
              safety, legality, or outcome of any tattoo services obtained
              through the Platform
            </li>
            <li>
              Inked Market does <strong>not</strong> verify the licensing,
              certifications, health compliance, or qualifications of any artist
              or studio
            </li>
            <li>
              Inked Market does <strong>not</strong> mediate, arbitrate, or
              guarantee resolution of disputes between users
            </li>
          </ul>

          <h3>Future Services</h3>
          <p>
            Inked Market may introduce additional features and integrations over
            time, including but not limited to: booking integration via
            third-party partners (such as Porter or InkBook), payment
            processing, messaging, calendar synchronization, portfolio import
            tools, and embeddable widgets for external websites. These features,
            when introduced, will be governed by these Terms and any additional
            terms presented at the time of their introduction.
          </p>
        </>
      ),
    },
    {
      id: "accounts",
      number: "03",
      title: "ACCOUNT TERMS",
      personalityIntro:
        "Your account is like your tattoo chair -- keep it clean and don't let anyone else sit in it.",
      content: (
        <>
          <h3>Registration</h3>
          <p>
            To access certain features of the Platform, you must create an
            account. During registration, you agree to provide accurate,
            current, and complete information as prompted by the registration
            form. You may register as a customer, an individual tattoo artist,
            or a tattoo studio.
          </p>

          <h3>Accuracy Obligation</h3>
          <p>
            You are responsible for maintaining the accuracy of all information
            associated with your account, including but not limited to: your
            name, email address, phone number, location, business information,
            portfolio content, style tags, pricing ranges, and availability. You
            agree to promptly update your account information if any changes
            occur.
          </p>

          <h3>One Account Per Person</h3>
          <p>
            Each individual may maintain only one personal account on the
            Platform. Artists may have one artist profile in addition to any
            studio profile they manage. Creating multiple accounts to circumvent
            restrictions, manipulate reviews, or deceive other users is strictly
            prohibited and grounds for immediate termination.
          </p>

          <h3>Account Security</h3>
          <p>
            You are solely responsible for maintaining the confidentiality of
            your account credentials, including your password and any
            authentication tokens. You agree to immediately notify Inked Market
            of any unauthorized access to or use of your account. Inked Market
            is not liable for any loss or damage arising from your failure to
            secure your account.
          </p>

          <h3>Suspension and Termination</h3>
          <p>
            Inked Market reserves the right to suspend, disable, or terminate
            your account at any time, with or without notice, for any reason
            including but not limited to: violation of these Terms, inactivity,
            fraudulent activity, or conduct that Inked Market determines is
            harmful to other users or the Platform.
          </p>

          <h3>Keeping Information Current</h3>
          <p>
            You agree to keep your account information up to date at all times.
            Inked Market may periodically send verification prompts to confirm
            the accuracy of your profile information. Failure to respond to
            verification requests may result in your profile being flagged as
            potentially outdated or temporarily hidden from search results.
          </p>
        </>
      ),
    },
    {
      id: "conduct",
      number: "04",
      title: "USER CONDUCT & PROHIBITED ACTIVITIES",
      personalityIntro:
        "Every studio has a 'we reserve the right to refuse service' sign. This is ours.",
      content: (
        <>
          <p>
            You agree to use the Platform only for lawful purposes and in
            accordance with these Terms. The following activities are strictly
            prohibited. Engaging in any of the following may result in warning,
            content removal, account suspension, or permanent ban at Inked
            Market&apos;s sole discretion.
          </p>

          <h3>1. Fraud and Misrepresentation</h3>
          <ul>
            <li>
              Creating fake profiles or impersonating any person or entity
            </li>
            <li>
              Misrepresenting your qualifications, certifications, licensing, or
              experience
            </li>
            <li>
              Using misleading credentials, fake portfolio images, or fabricated
              reviews
            </li>
            <li>
              Providing false or misleading information about a studio&apos;s
              location, hours, services, or pricing
            </li>
            <li>
              Operating under a false identity or using another person&apos;s
              account without authorization
            </li>
          </ul>

          <h3>2. Harassment and Harmful Conduct</h3>
          <ul>
            <li>
              Threatening, intimidating, bullying, or harassing any user,
              artist, studio owner, or Inked Market staff
            </li>
            <li>
              Posting or transmitting hate speech, discriminatory content, or
              content that promotes violence
            </li>
            <li>
              Doxxing: publishing private or identifying information about
              another person without their consent
            </li>
            <li>
              Stalking, unwanted contact, or persistent communication after
              being asked to stop
            </li>
            <li>
              Sexually explicit, obscene, or otherwise offensive communications
              directed at other users
            </li>
          </ul>

          <h3>3. Intellectual Property Infringement</h3>
          <ul>
            <li>
              Uploading portfolio images or designs that you did not create or
              do not have the right to display
            </li>
            <li>
              Copying, reproducing, or claiming ownership of another
              artist&apos;s tattoo designs, flash art, or original works
            </li>
            <li>
              Using copyrighted images, logos, or trademarks without proper
              authorization
            </li>
            <li>
              Scraping or downloading portfolio content for use outside the
              Platform
            </li>
          </ul>

          <h3>4. Platform Integrity Violations</h3>
          <ul>
            <li>
              Scraping, crawling, or using bots, spiders, or automated tools to
              access or collect data from the Platform without prior written
              consent
            </li>
            <li>
              Reverse engineering, decompiling, disassembling, or otherwise
              attempting to derive the source code of the Platform
            </li>
            <li>
              Circumventing, disabling, or interfering with any security
              features, access controls, or usage limits
            </li>
            <li>
              Introducing malware, viruses, Trojan horses, or any other
              malicious code
            </li>
            <li>
              Overloading, flooding, or otherwise disrupting the Platform&apos;s
              infrastructure
            </li>
          </ul>

          <h3>5. Review Manipulation</h3>
          <ul>
            <li>
              Posting fake reviews, whether positive or negative, for any
              artist, studio, or service
            </li>
            <li>
              Offering or accepting payment, discounts, free services, or any
              other incentive in exchange for reviews
            </li>
            <li>
              Coordinated review bombing: organizing groups to leave negative
              reviews on a competitor&apos;s profile
            </li>
            <li>
              Pressuring or coercing customers to leave or remove reviews
            </li>
            <li>
              Creating multiple accounts for the purpose of posting additional
              reviews
            </li>
          </ul>

          <h3>6. Commercial Misuse</h3>
          <ul>
            <li>
              Sending unsolicited commercial messages, spam, or advertisements
              to other users
            </li>
            <li>
              Using the Platform to advertise services unrelated to tattoo
              artistry or the tattoo industry
            </li>
            <li>
              Promoting competing marketplace or discovery platforms within
              Inked Market profiles, messages, or reviews
            </li>
            <li>
              Harvesting user contact information for marketing purposes outside
              the Platform
            </li>
          </ul>

          <h3>7. Legal Violations</h3>
          <ul>
            <li>
              Posting content that is illegal under applicable federal, state,
              or local law
            </li>
            <li>
              Offering or facilitating tattoo services in violation of
              applicable licensing, permitting, or health and safety regulations
            </li>
            <li>
              Tattooing minors or facilitating contact between minors and tattoo
              services
            </li>
            <li>
              Engaging in money laundering, fraud, or other financial crimes
              through the Platform
            </li>
          </ul>

          <h3>Consequences</h3>
          <p>
            Inked Market may take any of the following actions in response to
            violations, at its sole discretion and without obligation to follow
            a specific order of escalation:
          </p>
          <ol>
            <li>
              <strong>Warning:</strong> A formal notice identifying the
              violation and required corrective action
            </li>
            <li>
              <strong>Content Removal:</strong> Removal of specific content that
              violates these Terms
            </li>
            <li>
              <strong>Temporary Suspension:</strong> Temporary restriction of
              account access for a defined period
            </li>
            <li>
              <strong>Permanent Ban:</strong> Permanent termination of account
              and prohibition from creating new accounts
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "user-content",
      number: "05",
      title: "USER-GENERATED CONTENT",
      personalityIntro:
        "Your art stays yours. We just need permission to show it off.",
      content: (
        <>
          <h3>License Grant</h3>
          <p>
            By submitting, posting, or uploading content to the Platform
            (&quot;User Content&quot;), including but not limited to portfolio
            images, profile information, bios, reviews, comments, and messages,
            you grant Inked Market a non-exclusive, worldwide, royalty-free,
            sublicensable, transferable license to use, reproduce, display,
            distribute, modify, adapt, create derivative works from, and
            otherwise exploit your User Content in connection with the operation,
            promotion, and improvement of the Platform. This license continues
            for as long as your User Content remains on the Platform and for a
            reasonable period after removal to account for caching and archival.
          </p>

          <h3>Ownership</h3>
          <p>
            You retain all ownership rights in your User Content. Nothing in
            these Terms transfers ownership of your intellectual property to
            Inked Market. The license granted above is solely for the purpose of
            operating and promoting the Platform.
          </p>

          <h3>Content Standards</h3>
          <p>
            All User Content must comply with these Terms and applicable law.
            You represent and warrant that: (a) you own or have the necessary
            rights and permissions to post the content; (b) your content does
            not infringe, violate, or misappropriate any third party&apos;s
            rights, including intellectual property, privacy, or publicity
            rights; (c) your content is accurate and not misleading; and (d)
            your content does not contain malicious code or harmful material.
          </p>

          <h3>Right to Remove</h3>
          <p>
            Inked Market reserves the right, but has no obligation, to review,
            monitor, edit, or remove any User Content at its sole discretion,
            including content that violates these Terms, is objectionable, or
            poses a risk to the Platform or its users.
          </p>

          <h3>DMCA Takedown Process</h3>
          <p>
            Inked Market respects the intellectual property rights of others and
            complies with the Digital Millennium Copyright Act (&quot;DMCA&quot;),
            17 U.S.C. Section 512.
          </p>

          <p>
            <strong>Designated Agent:</strong> Inked Market&apos;s designated
            agent for receiving DMCA notices is:
          </p>
          <p>
            DMCA Agent, Inked Market
            <br />
            Email: dmca@inkedmarket.com
          </p>

          <p>
            <strong>Filing a DMCA Notice:</strong> If you believe that content
            on the Platform infringes your copyright, you may submit a
            notification to our designated agent containing the following:
          </p>
          <ol>
            <li>
              Identification of the copyrighted work claimed to have been
              infringed, or a representative list if multiple works are involved
            </li>
            <li>
              Identification of the material that is claimed to be infringing
              and its location on the Platform (URL or other specific
              identification)
            </li>
            <li>
              Your contact information, including name, address, telephone
              number, and email address
            </li>
            <li>
              A statement that you have a good-faith belief that the use of the
              material in the manner complained of is not authorized by the
              copyright owner, its agent, or the law
            </li>
            <li>
              A statement, made under penalty of perjury, that the information
              in the notification is accurate and that you are the copyright
              owner or authorized to act on the owner&apos;s behalf
            </li>
            <li>
              A physical or electronic signature of the copyright owner or
              authorized agent
            </li>
          </ol>

          <p>
            <strong>Counter-Notice:</strong> If you believe your content was
            removed in error, you may submit a counter-notice containing: (a)
            identification of the removed material and its former location; (b)
            a statement under penalty of perjury that you have a good-faith
            belief the material was removed as a result of mistake or
            misidentification; (c) your name, address, and telephone number; (d)
            a statement consenting to the jurisdiction of the federal district
            court for the district in which your address is located; and (e)
            your physical or electronic signature.
          </p>

          <p>
            <strong>Repeat Infringer Policy:</strong> Inked Market maintains a
            policy of terminating, in appropriate circumstances, the accounts of
            users who are repeat infringers. A user who receives three (3) valid
            DMCA notices will have their account permanently terminated. Inked
            Market may also terminate accounts after fewer notices in egregious
            cases.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      number: "06",
      title: "INTELLECTUAL PROPERTY & TATTOO COPYRIGHT",
      personalityIntro:
        "Tattoo copyright is real, respected, and surprisingly litigated. Here's the deal.",
      content: (
        <>
          <h3>Platform Intellectual Property</h3>
          <p>
            The Inked Market Platform, including its design, layout, look and
            feel, graphics, logos, trademarks, service marks, source code,
            algorithms, and all other proprietary content and technology, is
            owned by or licensed to Inked Market and is protected by copyright,
            trademark, trade secret, and other intellectual property laws. You
            may not copy, modify, distribute, sell, lease, or create derivative
            works based on the Platform or its proprietary content without prior
            written consent from Inked Market.
          </p>

          <h3>Tattoo Copyright Law</h3>
          <p>
            Original tattoo designs are protectable works of authorship under
            United States copyright law. The tattoo artist is generally the
            copyright holder of their original designs, including both the
            design artwork and (in many cases) the tattoo as applied to the
            body. This is an evolving area of law, and users should be aware of
            the following principles:
          </p>
          <ul>
            <li>
              <strong>Artist Ownership:</strong> The artist who creates an
              original tattoo design generally holds the copyright to that
              design unless a written work-for-hire agreement or assignment
              provides otherwise
            </li>
            <li>
              <strong>Client&apos;s Implied License:</strong> A client who
              receives a tattoo generally has an implied license to display the
              tattoo on their body in everyday life. This implied license does
              not typically extend to commercial reproduction or exploitation of
              the design
            </li>
            <li>
              <strong>Platform Display License:</strong> By uploading portfolio
              images to Inked Market, artists grant the Platform a license to
              display and promote those images as described in Section 5 (User
              Content)
            </li>
          </ul>

          <h3>Relevant Case Law</h3>
          <p>
            Users should be aware that tattoo copyright has been the subject of
            significant litigation, including:
          </p>
          <ul>
            <li>
              <strong>Solid Oak Sketches, LLC v. 2K Games, Inc.</strong> (S.D.N.Y.
              2020) &mdash; Addressed whether tattoo designs on NBA players could
              be reproduced in a video game. The court found de minimis use and
              an implied license, but affirmed that tattoos are copyrightable
              works.
            </li>
            <li>
              <strong>Whitmill v. Warner Bros. Entertainment Inc.</strong> (E.D.
              Mo. 2011) &mdash; Involved the reproduction of Mike Tyson&apos;s
              facial tattoo in the film &quot;The Hangover Part II.&quot; The
              court acknowledged the tattoo artist&apos;s copyright claim,
              though the case settled.
            </li>
          </ul>

          <h3>Your Obligations</h3>
          <p>
            By using the Platform, you agree to:
          </p>
          <ul>
            <li>
              Respect the copyright of all tattoo designs, flash art, and
              portfolio images displayed on the Platform
            </li>
            <li>
              Not copy, reproduce, trace, or create unauthorized derivative
              works from designs found on the Platform without the
              artist&apos;s explicit permission
            </li>
            <li>
              Not claim ownership of designs created by another artist
            </li>
            <li>
              Not download, screenshot, or redistribute portfolio images for
              use outside the Platform without the artist&apos;s consent
            </li>
            <li>
              Understand that requesting a tattoo &quot;just like&quot; another
              artist&apos;s design may constitute copyright infringement
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "artist-studio-terms",
      number: "07",
      title: "ARTIST & STUDIO TERMS",
      personalityIntro:
        "If you're listed here, you're running your own show. We just gave you the stage.",
      content: (
        <>
          <p>
            The following additional terms apply to users who register as tattoo
            artists or tattoo studio operators on the Platform.
          </p>

          <h3>Profile Accuracy</h3>
          <p>
            Artists and studios are obligated to maintain accurate, truthful, and
            up-to-date profile information at all times. This includes but is
            not limited to: business name, location and address, contact
            information, operating hours, style specializations, pricing ranges,
            portfolio images, and biographical information. Inaccurate or
            misleading profiles may be flagged, hidden from search results, or
            removed.
          </p>

          <h3>Licensing and Permits</h3>
          <p>
            By creating an artist or studio profile, you self-certify that you
            hold all licenses, permits, and certifications required by
            applicable federal, state, and local laws to operate a tattoo
            business or practice as a tattoo artist in your jurisdiction.{" "}
            <strong>
              Inked Market does not verify, validate, or guarantee the
              licensing, permitting, or certification status of any artist or
              studio listed on the Platform.
            </strong>{" "}
            Users seeking tattoo services are encouraged to independently verify
            an artist&apos;s or studio&apos;s credentials before booking.
          </p>

          <h3>Health and Safety Compliance</h3>
          <p>
            Compliance with all applicable health and safety regulations,
            including but not limited to bloodborne pathogen protocols,
            sterilization standards, infection control procedures, and
            Occupational Safety and Health Administration (OSHA) requirements,
            is solely the responsibility of the artist and/or studio. Inked Market
            has no responsibility for and makes no representations regarding the
            health, safety, or sanitary practices of any listed artist or studio.
          </p>

          <h3>Photo Consent</h3>
          <p>
            By uploading portfolio images that depict identifiable individuals,
            you represent and warrant that you have obtained appropriate consent
            from each depicted individual for the use and display of their
            likeness on the Platform. Inked Market reserves the right to remove
            any image for which consent cannot be demonstrated.
          </p>

          <h3>Verification and Staleness</h3>
          <p>
            To maintain the quality and accuracy of the Platform, Inked Market
            may send periodic verification prompts to artists and studios.
          </p>
          <ul>
            <li>
              <strong>30-Day Verification:</strong> You agree to respond to
              verification prompts within thirty (30) days of receipt. Failure
              to respond may result in your profile being flagged as
              &quot;Unverified&quot; or temporarily hidden from search results.
            </li>
            <li>
              <strong>6-Month Inactivity:</strong> Profiles with no updates,
              logins, or activity for six (6) consecutive months may be flagged
              as potentially inactive, deprioritized in search results, or
              marked with a staleness indicator visible to other users.
            </li>
          </ul>

          <h3>Independent Operator Status</h3>
          <p>
            <strong>
              Artists and studios listed on Inked Market are independent operators
              and are not employees, contractors, agents, or representatives of
              Inked Market.
            </strong>{" "}
            Nothing in these Terms creates an employment, partnership, joint
            venture, agency, or franchise relationship between Inked Market and
            any artist or studio. Artists and studios are solely responsible for
            their own business operations, tax obligations, insurance, and
            compliance with applicable laws.
          </p>
        </>
      ),
    },
    {
      id: "customer-terms",
      number: "08",
      title: "CUSTOMER TERMS",
      personalityIntro:
        "You found the artist. Now the relationship is between you and them -- we're just the matchmaker.",
      content: (
        <>
          <p>
            The following additional terms apply to users who use the Platform
            to discover, research, or engage with tattoo artists and studios.
          </p>

          <h3>Booking and Service Responsibility</h3>
          <p>
            All arrangements for tattoo services, including consultations,
            appointments, pricing, deposits, cancellations, and the actual
            tattooing, are made directly between you and the artist or studio. You
            acknowledge that Inked Market is not a party to these transactions
            and has no control over the quality, safety, legality, or timeliness
            of any tattoo service. You are responsible for conducting your own
            due diligence before booking with any artist or studio.
          </p>

          <h3>Assumption of Risk</h3>
          <p>
            Tattooing involves inherent risks (described further in Section 11).
            By using the Platform to find and engage with tattoo professionals,
            you voluntarily assume all risks associated with obtaining tattoo
            services. Inked Market is not liable for any injury, adverse
            reaction, unsatisfactory result, or other harm arising from tattoo
            services obtained through connections made on the Platform.
          </p>

          <h3>Review Integrity</h3>
          <p>
            If and when Inked Market implements a review system, the following
            rules apply:
          </p>
          <ul>
            <li>
              <strong>Verified Reviews:</strong> When available, reviews will be
              limited to verified interactions. Only customers who have
              completed a verified booking or confirmed visit will be eligible
              to leave reviews.
            </li>
            <li>
              Reviews must be honest, accurate, and based on genuine personal
              experience
            </li>
            <li>
              You may not post fake reviews, pay for reviews, accept
              compensation for reviews, or post reviews on behalf of others
            </li>
            <li>
              Reviews that contain threats, hate speech, personal attacks,
              defamation, or content unrelated to the tattoo service experience
              may be removed
            </li>
            <li>
              Inked Market reserves the right to investigate and remove reviews
              that appear fraudulent, manipulated, or in violation of these
              Terms
            </li>
          </ul>

          <h3>Disputes with Artists and Studios</h3>
          <p>
            Any disputes arising from tattoo services, including but not limited
            to quality of work, pricing disagreements, deposit refunds,
            appointment cancellations, or health complications, are between you
            and the artist or studio. Inked Market may, at its sole discretion,
            offer to facilitate informal mediation between parties but is under
            no obligation to do so. Inked Market is not responsible for
            resolving disputes and bears no liability for their outcome.
          </p>
        </>
      ),
    },
    {
      id: "third-party",
      number: "09",
      title: "THIRD-PARTY SERVICES",
      personalityIntro:
        "We partner with some solid tools. Their house, their rules.",
      content: (
        <>
          <p>
            The Platform may integrate with, link to, or rely upon third-party
            services, applications, and platforms. Your use of these third-party
            services is subject to their respective terms of service and privacy
            policies.
          </p>

          <h3>Instagram (Meta Platforms, Inc.)</h3>
          <p>
            Inked Market may offer Instagram OAuth integration to allow artists
            to import portfolio images from their Instagram accounts. By
            connecting your Instagram account, you authorize Inked Market to
            access and import your public Instagram content in accordance with
            Meta&apos;s Platform Terms and Instagram&apos;s Terms of Use. Inked
            Market is not responsible for any changes to Instagram&apos;s API,
            availability, or terms that may affect this integration.
          </p>

          <h3>Stripe (Stripe, Inc.)</h3>
          <p>
            If and when Inked Market introduces payment processing features, all
            financial transactions will be processed by Stripe. By using payment
            features, you agree to Stripe&apos;s Terms of Service and Connected
            Account Agreement as applicable. Inked Market does not store credit
            card numbers or sensitive financial information directly; all
            payment data is handled by Stripe in accordance with PCI-DSS
            standards.
          </p>

          <h3>Google Maps / Mapbox</h3>
          <p>
            The Platform may use Google Maps API or Mapbox for location-based
            features, including studio discovery, distance calculation, and map
            display. Your use of these features is subject to Google&apos;s
            Terms of Service and Privacy Policy or Mapbox&apos;s Terms of
            Service, as applicable.
          </p>

          <h3>Booking Partners</h3>
          <p>
            Inked Market may integrate with third-party booking platforms such
            as Porter, InkBook, or similar services to facilitate appointment
            scheduling. These integrations are provided as a convenience, and
            Inked Market is not responsible for the availability, accuracy, or
            performance of any third-party booking service. Any bookings made
            through these integrations are subject to the booking
            platform&apos;s own terms and policies.
          </p>

          <h3>General Third-Party Disclaimer</h3>
          <p>
            Inked Market does not endorse, guarantee, or assume responsibility
            for any third-party service, product, or content. Your interactions
            with third-party services are solely between you and the third
            party. Inked Market is not liable for any loss, damage, or harm
            resulting from your use of or reliance on any third-party service.
          </p>
        </>
      ),
    },
    {
      id: "payments",
      number: "10",
      title: "PAYMENT TERMS",
      personalityIntro:
        "Right now it's free to join the party. When the tip jar comes out, we'll let you know.",
      content: (
        <>
          <h3>Current Pricing</h3>
          <p>
            As of the effective date of these Terms, access to the Inked Market
            Platform is provided free of charge to all users, including artists,
            studios, and customers. No fees are currently charged for account
            creation, profile listing, portfolio hosting, or discovery features.
          </p>

          <h3>Future Pricing Framework</h3>
          <p>
            Inked Market reserves the right to introduce fees, charges, and paid
            features in the future, which may include but are not limited to:
          </p>
          <ul>
            <li>
              <strong>Platform Fees:</strong> Transaction fees or service charges
              for bookings facilitated through the Platform
            </li>
            <li>
              <strong>Commissions:</strong> Percentage-based commissions on
              transactions between artists/studios and customers
            </li>
            <li>
              <strong>Subscription Plans:</strong> Tiered subscription models
              offering premium features, enhanced visibility, analytics, or
              priority placement in search results
            </li>
            <li>
              <strong>Promoted Listings:</strong> Paid advertising or promoted
              placement options for artists and studios
            </li>
          </ul>
          <p>
            Any introduction of fees will be communicated to affected users with
            at least thirty (30) days advance notice. Users may choose to
            discontinue use of paid features or close their account if they do
            not agree to the new pricing terms.
          </p>

          <h3>Payment Processing</h3>
          <p>
            All payments, when introduced, will be processed through Stripe or
            another reputable third-party payment processor. Inked Market does
            not directly process, store, or handle credit card information or
            sensitive financial data.
          </p>

          <h3>Transactions Between Users</h3>
          <p>
            Any financial transactions between customers and artists or studios,
            including deposits, payments for tattoo services, tips, and refunds,
            are conducted directly between those parties.{" "}
            <strong>
              Inked Market is not a party to these financial transactions
            </strong>{" "}
            and is not responsible for payment disputes, chargebacks, refund
            requests, or any financial disagreements between users. Artists and
            studios are solely responsible for their own refund, cancellation, and
            deposit policies.
          </p>
        </>
      ),
    },
    {
      id: "disclaimers",
      number: "11",
      title: "DISCLAIMERS & LIMITATION OF LIABILITY",
      personalityIntro:
        "Tattoos are permanent. So is this disclaimer. Read it carefully.",
      content: (
        <>
          <h3>As-Is / As-Available</h3>
          <p>
            THE PLATFORM AND ALL SERVICES ARE PROVIDED ON AN &quot;AS IS&quot;
            AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY
            APPLICABLE LAW, INKED MARKET DISCLAIMS ALL WARRANTIES, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF
            DEALING OR USAGE OF TRADE.
          </p>

          <h3>Health and Safety Disclaimer</h3>
          <p>
            <strong>
              TATTOOING INVOLVES INHERENT HEALTH AND SAFETY RISKS.
            </strong>{" "}
            Inked Market does not provide, supervise, or control any tattoo
            services and bears no responsibility for health outcomes. Risks
            associated with tattooing include but are not limited to:
          </p>
          <ul>
            <li>
              <strong>Allergic reactions</strong> to tattoo ink, including red,
              yellow, and other colored inks containing metals or organic
              compounds
            </li>
            <li>
              <strong>Bacterial infections</strong> including Staphylococcus
              aureus and Methicillin-resistant Staphylococcus aureus (MRSA)
            </li>
            <li>
              <strong>Viral infections</strong> including Hepatitis B, Hepatitis
              C, and (in rare cases) HIV, particularly in unlicensed or
              unsanitary environments
            </li>
            <li>
              <strong>Scarring and keloid formation,</strong> particularly in
              individuals predisposed to keloid scarring
            </li>
            <li>
              <strong>MRI complications:</strong> Certain tattoo inks containing
              metallic compounds may cause swelling, burning, or distortion
              during magnetic resonance imaging (MRI) procedures
            </li>
            <li>
              <strong>Granulomas:</strong> Nodules of inflamed tissue that may
              form around particles of tattoo ink
            </li>
            <li>
              <strong>Skin irritation and dermatitis</strong> during the healing
              process
            </li>
            <li>
              <strong>Bloodborne pathogen exposure</strong> if proper
              sterilization and needle safety protocols are not followed
            </li>
          </ul>

          <h3>No Guarantees</h3>
          <p>
            Inked Market does not guarantee and makes no representations
            regarding:
          </p>
          <ul>
            <li>
              The skill, experience, talent, or qualifications of any artist
            </li>
            <li>
              The cleanliness, safety, or regulatory compliance of any studio
            </li>
            <li>
              The validity or currency of any license or permit claimed by an
              artist or studio
            </li>
            <li>
              The availability of any artist or studio at any given time
            </li>
            <li>
              The accuracy of any information provided by artists, studios, or
              other users
            </li>
            <li>
              The outcome, quality, or satisfaction of any tattoo service
            </li>
            <li>
              The continuous, uninterrupted, or error-free operation of the
              Platform
            </li>
          </ul>

          <h3>Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
            SHALL INKED MARKET, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
            AFFILIATES, SUCCESSORS, OR ASSIGNS BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
            BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE,
            DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR
            USE OF OR INABILITY TO USE THE PLATFORM, REGARDLESS OF THE THEORY
            OF LIABILITY (CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE) AND
            EVEN IF INKED MARKET HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
            DAMAGES.
          </p>
          <p>
            IN NO EVENT SHALL INKED MARKET&apos;S AGGREGATE LIABILITY TO YOU
            FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE
            PLATFORM EXCEED THE GREATER OF: (A) ONE HUNDRED U.S. DOLLARS
            ($100.00); OR (B) THE TOTAL FEES PAID BY YOU TO INKED MARKET IN THE
            TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
          </p>
          <p>
            SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF
            CERTAIN DAMAGES. IN SUCH JURISDICTIONS, INKED MARKET&apos;S
            LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          </p>
        </>
      ),
    },
    {
      id: "indemnification",
      number: "12",
      title: "INDEMNIFICATION",
      personalityIntro:
        "If something goes sideways because of your actions, that's on you -- not us.",
      content: (
        <>
          <p>
            You agree to indemnify, defend, and hold harmless Inked Market, its
            officers, directors, employees, agents, affiliates, successors, and
            assigns (collectively, the &quot;Indemnified Parties&quot;) from and
            against any and all claims, demands, actions, damages, losses,
            liabilities, costs, and expenses (including reasonable
            attorneys&apos; fees and court costs) arising out of or related to:
          </p>
          <ul>
            <li>
              <strong>Your User Content:</strong> Any content you submit, post,
              upload, or transmit through the Platform, including claims of
              intellectual property infringement, defamation, or violation of
              privacy or publicity rights
            </li>
            <li>
              <strong>Your Use of the Services:</strong> Your access to and use
              of the Platform, including any interactions with other users,
              artists, or studios facilitated through the Platform
            </li>
            <li>
              <strong>Violation of Terms:</strong> Any breach or alleged breach
              of these Terms by you, including any representations and
              warranties made herein
            </li>
            <li>
              <strong>Third-Party Rights:</strong> Any violation or alleged
              violation of any third party&apos;s rights, including intellectual
              property rights, privacy rights, or contractual rights
            </li>
            <li>
              <strong>Tattoo Services:</strong> Any claims, injuries, adverse
              reactions, health complications, or damages arising from tattoo
              services you obtained through connections made on the Platform,
              regardless of whether those services were booked directly or
              through a third-party integration
            </li>
            <li>
              <strong>Tattoo Services Provided:</strong> If you are an artist or
              studio, any claims arising from tattoo services you provide to
              customers who discovered you through the Platform
            </li>
          </ul>
          <p>
            Inked Market reserves the right, at its own expense, to assume the
            exclusive defense and control of any matter subject to
            indemnification by you, in which event you agree to cooperate fully
            with Inked Market in asserting any available defenses. This
            indemnification obligation shall survive the termination of your
            account and these Terms.
          </p>
        </>
      ),
    },
    {
      id: "disputes",
      number: "13",
      title: "DISPUTE RESOLUTION",
      personalityIntro:
        "Let's talk it out before we lawyer up. Seriously -- it's cheaper for everyone.",
      content: (
        <>
          <h3>Informal Resolution</h3>
          <p>
            Before initiating any formal dispute resolution proceeding, you
            agree to first attempt to resolve any dispute, claim, or controversy
            arising out of or related to these Terms or the Platform
            (&quot;Dispute&quot;) informally by contacting Inked Market at
            legal@inkedmarket.com. You must provide a written description of the
            Dispute, all relevant documents and information, and the relief you
            seek. Both parties agree to negotiate in good faith for at least
            thirty (30) days from the date the Dispute notice is received before
            pursuing formal resolution.
          </p>

          <h3>Binding Arbitration</h3>
          <p>
            If the Dispute is not resolved through informal negotiation within
            thirty (30) days, either party may initiate binding arbitration
            administered by the American Arbitration Association
            (&quot;AAA&quot;) under its Consumer Arbitration Rules (or
            Commercial Arbitration Rules if both parties are businesses). The
            arbitration shall be conducted by a single arbitrator, in the
            English language, and the arbitrator&apos;s decision shall be final
            and binding. Judgment on the arbitral award may be entered in any
            court of competent jurisdiction.
          </p>

          <h3>Class Action Waiver</h3>
          <p>
            <strong>
              YOU AND INKED MARKET AGREE THAT EACH MAY BRING CLAIMS AGAINST THE
              OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A
              PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR
              REPRESENTATIVE ACTION.
            </strong>{" "}
            Unless both parties agree otherwise in writing, the arbitrator may
            not consolidate more than one person&apos;s claims, may not preside
            over any form of class or representative proceeding, and may not
            award relief to any person other than the individual party seeking
            relief.
          </p>

          <h3>Small Claims Court Exception</h3>
          <p>
            Notwithstanding the above, either party may bring an individual
            action in small claims court for Disputes within the
            jurisdiction&apos;s monetary limits, provided the action is not
            removed to or transferred to a different court.
          </p>

          <h3>30-Day Opt-Out Right</h3>
          <p>
            You may opt out of the binding arbitration and class action waiver
            provisions of this section by sending written notice to
            legal@inkedmarket.com within thirty (30) days of first accepting
            these Terms. Your notice must include your name, account username or
            email address, mailing address, and a clear statement that you wish
            to opt out of arbitration. If you opt out, all Disputes will be
            resolved in the courts specified under &quot;Governing Law&quot;
            below.
          </p>

          <h3>Governing Law</h3>
          <p>
            These Terms and any Dispute shall be governed by and construed in
            accordance with the laws of the State of Delaware, without regard to
            its conflict of law provisions. If arbitration does not apply (due
            to opt-out or small claims exception), you agree to submit to the
            exclusive jurisdiction of the state and federal courts located in
            the State of Delaware for resolution of any Dispute.
          </p>
        </>
      ),
    },
    {
      id: "modifications",
      number: "14",
      title: "MODIFICATION OF TERMS",
      personalityIntro:
        "The rules may evolve, but we'll always give you a heads-up before anything changes.",
      content: (
        <>
          <h3>Right to Modify</h3>
          <p>
            Inked Market reserves the right to modify, amend, or update these
            Terms at any time and at its sole discretion. Modified Terms will be
            effective upon posting to the Platform, unless a later effective date
            is specified.
          </p>

          <h3>Notice of Material Changes</h3>
          <p>
            For material changes to these Terms, which include but are not
            limited to changes to the dispute resolution process, limitation of
            liability, user rights, or the introduction of new fees, Inked
            Market will provide at least thirty (30) days advance notice through
            one or more of the following methods:
          </p>
          <ul>
            <li>
              Email notification to the address associated with your account
            </li>
            <li>A prominent banner or notice displayed on the Platform</li>
            <li>A notification within your account dashboard</li>
          </ul>
          <p>
            Non-material changes, such as corrections of typographical errors,
            formatting updates, or clarifications that do not substantively
            alter your rights or obligations, may be made without advance
            notice.
          </p>

          <h3>Acceptance of Modified Terms</h3>
          <p>
            Your continued use of the Platform after the effective date of
            modified Terms constitutes your acceptance of those modified Terms.
            If you do not agree to the modified Terms, you must stop using the
            Platform and, if applicable, close your account before the effective
            date of the changes.
          </p>

          <h3>Right to Disagree</h3>
          <p>
            If you do not agree with a material change to these Terms, you may
            close your account at any time before the modified Terms take
            effect. Closing your account is your sole remedy for disagreement
            with modified Terms. Inked Market will provide instructions for
            account closure and data export upon request.
          </p>
        </>
      ),
    },
    {
      id: "termination",
      number: "15",
      title: "TERMINATION",
      personalityIntro:
        "All good things can end. Here's how the breakup works.",
      content: (
        <>
          <h3>Termination by Inked Market</h3>
          <p>
            Inked Market may suspend or terminate your account and access to the
            Platform at any time, with or without cause, and with or without
            notice. Reasons for termination may include but are not limited to:
            violation of these Terms, extended inactivity, fraudulent or illegal
            activity, conduct harmful to other users or the Platform, or
            discontinuation of the Platform. Where practicable, Inked Market
            will provide notice and an explanation for the termination, but is
            not required to do so in cases of serious violations.
          </p>

          <h3>Termination by User</h3>
          <p>
            You may close your account at any time by contacting Inked Market at
            legal@inkedmarket.com or using the account settings feature (when
            available). Upon account closure, your profile will be deactivated
            and removed from public search results. You may request deletion of
            your personal data in accordance with our Privacy Policy.
          </p>

          <h3>Effect of Termination</h3>
          <p>Upon termination of your account, whether by you or by Inked Market:</p>
          <ul>
            <li>
              Your license to access and use the Platform immediately ceases
            </li>
            <li>
              Your profile, portfolio images, and other content you submitted
              will be removed from public view, subject to reasonable delays for
              caching, archival, and technical processing
            </li>
            <li>
              Reviews you have written may persist on the Platform in anonymized
              form, as they constitute part of the public record of other
              users&apos; profiles
            </li>
            <li>
              Any outstanding obligations, including indemnification and payment
              obligations, remain in effect
            </li>
            <li>
              Inked Market may retain certain data as necessary to comply with
              legal obligations, resolve disputes, and enforce agreements
            </li>
          </ul>

          <h3>Survival</h3>
          <p>
            The following sections of these Terms shall survive termination of
            your account and these Terms: Section 5 (User-Generated Content,
            with respect to the license granted), Section 6 (Intellectual
            Property), Section 11 (Disclaimers &amp; Limitation of Liability),
            Section 12 (Indemnification), Section 13 (Dispute Resolution), and
            Section 16 (General Provisions). Any other provisions that by their
            nature should survive termination shall also survive.
          </p>
        </>
      ),
    },
    {
      id: "general",
      number: "16",
      title: "GENERAL PROVISIONS",
      personalityIntro:
        "The legal fine print that keeps the whole machine running smooth.",
      content: (
        <>
          <h3>Severability</h3>
          <p>
            If any provision of these Terms is found to be unlawful, void, or
            unenforceable by a court of competent jurisdiction, that provision
            shall be modified to the minimum extent necessary to make it
            enforceable, or if modification is not possible, severed from these
            Terms. The remaining provisions shall continue in full force and
            effect.
          </p>

          <h3>Entire Agreement</h3>
          <p>
            These Terms, together with the Privacy Policy and any additional
            terms you agree to when using specific features of the Platform,
            constitute the entire agreement between you and Inked Market
            regarding your use of the Platform. These Terms supersede all prior
            and contemporaneous agreements, proposals, representations, and
            understandings, whether written or oral, regarding the subject
            matter hereof.
          </p>

          <h3>No Waiver</h3>
          <p>
            The failure of Inked Market to exercise or enforce any right or
            provision of these Terms shall not constitute a waiver of such right
            or provision. A waiver of any right or provision will be effective
            only if made in writing and signed by an authorized representative
            of Inked Market. No waiver of any term shall be deemed a further or
            continuing waiver of such term or any other term.
          </p>

          <h3>Assignment</h3>
          <p>
            Inked Market may assign, transfer, or delegate its rights and
            obligations under these Terms, in whole or in part, at any time
            without notice or your consent. You may not assign, transfer, or
            delegate your rights or obligations under these Terms without the
            prior written consent of Inked Market. Any attempted assignment in
            violation of this provision is null and void.
          </p>

          <h3>Force Majeure</h3>
          <p>
            Inked Market shall not be liable for any failure or delay in
            performing its obligations under these Terms due to circumstances
            beyond its reasonable control, including but not limited to: acts of
            God, natural disasters, pandemics, epidemics, war, terrorism,
            riots, government actions or orders, labor disputes, power failures,
            internet or telecommunications failures, cyberattacks, or
            disruptions to third-party services on which the Platform depends.
          </p>

          <h3>Headings</h3>
          <p>
            The section headings in these Terms are for convenience of reference
            only and shall not affect the interpretation or construction of
            these Terms.
          </p>

          <h3>No Third-Party Beneficiaries</h3>
          <p>
            These Terms do not confer any rights, remedies, or benefits upon any
            person or entity other than you and Inked Market, except as
            expressly provided herein. No third party is intended to be a
            beneficiary of these Terms.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      number: "17",
      title: "CONTACT US",
      personalityIntro:
        "Got questions? We don't bite. Reach out anytime.",
      content: (
        <>
          <p>
            If you have questions, concerns, or feedback regarding these Terms
            of Service, please contact us using the information below:
          </p>

          <h3>General Legal Inquiries</h3>
          <p>
            Email: legal@inkedmarket.com
          </p>

          <h3>DMCA and Copyright Notices</h3>
          <p>
            For DMCA takedown notices, counter-notices, and copyright-related
            inquiries:
          </p>
          <p>
            DMCA Agent, Inked Market
            <br />
            Email: dmca@inkedmarket.com
          </p>

          <h3>Mailing Address</h3>
          <p>
            A physical mailing address will be published once Inked Market has
            formally incorporated. Until that time, all correspondence should be
            directed to legal@inkedmarket.com.
          </p>

          <h3>Response Time</h3>
          <p>
            Inked Market will make reasonable efforts to respond to all
            inquiries within five (5) business days. DMCA notices will be
            processed promptly and in accordance with the timelines set forth in
            Section 5.
          </p>
        </>
      ),
    },
  ],
};
