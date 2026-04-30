// Platform Settings Management - Types and Storage
// Handles institutional, legal, and support configuration

import { supabase } from '../lib/supabase';

export type DocumentStatus = 'draft' | 'published';

export interface LegalDocument {
  id: string;
  type: 'terms' | 'privacy' | 'cookies' | 'refund' | 'disclaimer';
  title: string;
  description?: string;
  content: string;
  status: DocumentStatus;
  lastUpdated: string; // ISO date
  visibleIn: ('footer' | 'login')[];
}

export interface HelpSupport {
  helpCenterText: string;
  faqs: FAQ[];
  supportEmail: string;
  documentationUrl?: string;
  contactUrl?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface CompanyInfo {
  appName: string;
  legalCompanyName: string;
  copyrightText: string;
  platformTagline: string;
  country?: string;
  websiteUrl?: string;
}

export interface BrandingConfig {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  appName: string;
  showAppName: boolean;
  compactLogoUrl?: string;
  faviconUrl?: string;
}

export interface DesignSettings {
  navigationIcons: {
    herbs: string; // lucide icon name
    formulas: string;
    prescriptions: string;
    builder: string;
    promos?: string;
    research?: string;
    courses?: string;
    news?: string;
    community?: string;
  };
  customSvgs?: {
    herbs?: string; // SVG content as string
    formulas?: string;
    prescriptions?: string;
    builder?: string;
    promos?: string;
    research?: string;
    courses?: string;
    news?: string;
    community?: string;
  };
  alertIcons: {
    pregnancy: string; // lucide icon name
    lactation: string;
    cautions: string;
    contraindications: string;
    interactions: string;
    drugInteractions: string;
    herbInteractions: string;
    toxicology: string;
    antagonisms: string;
    incompatibilities: string;
    allergens: string;
    herbDrugInteractions: string;
    herbHerbInteractions: string;
    pregnancyWarning: string;
  };
  customAlertSvgs?: {
    pregnancy?: string; // SVG content as string
    lactation?: string;
    cautions?: string;
    contraindications?: string;
    interactions?: string;
    drugInteractions?: string;
    herbInteractions?: string;
    toxicology?: string;
    antagonisms?: string;
    incompatibilities?: string;
    allergens?: string;
    herbDrugInteractions?: string;
    herbHerbInteractions?: string;
    pregnancyWarning?: string;
  };
  alertColors: {
    pregnancy: { bg: string; border: string; text: string; icon: string; };
    lactation: { bg: string; border: string; text: string; icon: string; };
    cautions: { bg: string; border: string; text: string; icon: string; };
    contraindications: { bg: string; border: string; text: string; icon: string; };
    interactions: { bg: string; border: string; text: string; icon: string; };
    drugInteractions: { bg: string; border: string; text: string; icon: string; };
    herbInteractions: { bg: string; border: string; text: string; icon: string; };
    toxicology: { bg: string; border: string; text: string; icon: string; };
    antagonisms: { bg: string; border: string; text: string; icon: string; };
    incompatibilities: { bg: string; border: string; text: string; icon: string; };
    allergens: { bg: string; border: string; text: string; icon: string; };
    herbDrugInteractions: { bg: string; border: string; text: string; icon: string; };
    herbHerbInteractions: { bg: string; border: string; text: string; icon: string; };
    pregnancyWarning: { bg: string; border: string; text: string; icon: string; };
  };
  fonts: {
    primaryFont: 'inter' | 'system' | 'noto-sans' | 'noto-serif';
    hanziFont: 'system' | 'noto-sans-sc' | 'noto-serif-sc' | 'ar-pl-kaiti';
  };
}

export interface BannerSettings {
  cooldownDaysAnswered: number; // Days to wait after user answers/completes a banner
  maxWeeklyImpacts: number; // Maximum number of banner interactions per week
}

export interface ComplianceDisclaimer {
  medicalDisclaimer: string;
  professionalUseNotice: string;
  nonDiagnosticDisclaimer: string;
  enabled: boolean;
}

export interface OAuthProviders {
  google: boolean;
  microsoft: boolean;
  apple: boolean;
}

export interface LoginOptions {
  allowEmailPassword: boolean;
  requireEmailVerification: boolean;
  enableTwoFactorAuth: boolean;
}

export interface RegistrationSettings {
  allowNewUserRegistration: boolean;
  requireAdminApproval: boolean;
}

export interface AuthenticationConfig {
  oauthProviders: OAuthProviders;
  loginOptions: LoginOptions;
  registrationSettings: RegistrationSettings;
}

export interface PlatformSettings {
  legalDocuments: LegalDocument[];
  helpSupport: HelpSupport;
  companyInfo: CompanyInfo;
  branding: BrandingConfig;
  compliance: ComplianceDisclaimer;
  authentication: AuthenticationConfig;
  designSettings: DesignSettings;
  bannerSettings: BannerSettings;
}

// Storage keys
const PLATFORM_SETTINGS_KEY = 'platform_settings';

// Helper to load settings from Supabase
async function loadFromSupabase(): Promise<Partial<PlatformSettings> | null> {
  try {
    console.log('⚙️ Platform Settings - Loading from Supabase...');

    const { data, error } = await supabase
      .from('admin_platform_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('❌ Platform Settings - Supabase error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Platform Settings - No settings in Supabase');
      return null;
    }

    // Convert array of {setting_key, setting_value} to PlatformSettings object
    const settings: any = {};
    data.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    console.log('✅ Platform Settings - Loaded from Supabase');
    return settings;
  } catch (error) {
    console.error('❌ Platform Settings - Error loading from Supabase:', error);
    return null;
  }
}

// Helper to save settings to Supabase
async function saveToSupabase(settings: PlatformSettings): Promise<boolean> {
  try {
    console.log('💾 Platform Settings - Saving to Supabase...');

    // Save each section as a separate row
    const sections = [
      { key: 'legal_documents', value: settings.legalDocuments },
      { key: 'help_support', value: settings.helpSupport },
      { key: 'company_info', value: settings.companyInfo },
      { key: 'branding', value: settings.branding },
      { key: 'compliance', value: settings.compliance },
      { key: 'authentication', value: settings.authentication },
      { key: 'design_settings', value: settings.designSettings },
      { key: 'banner_settings', value: settings.bannerSettings },
    ];

    for (const section of sections) {
      const { error } = await supabase
        .from('admin_platform_settings')
        .upsert({
          setting_key: section.key,
          setting_value: section.value,
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error(`❌ Platform Settings - Error saving ${section.key}:`, error);
        throw error;
      }
    }

    console.log('✅ Platform Settings - Saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Platform Settings - Error saving to Supabase:', error);
    return false;
  }
}

// Initialize settings from Supabase on app load
export async function initializePlatformSettings(): Promise<void> {
  const supabaseSettings = await loadFromSupabase();

  if (supabaseSettings) {
    // Merge Supabase settings with defaults
    const merged = {
      ...DEFAULT_SETTINGS,
      ...supabaseSettings,
      branding: {
        ...DEFAULT_SETTINGS.branding,
        ...(supabaseSettings.branding || {})
      },
      designSettings: {
        ...DEFAULT_SETTINGS.designSettings,
        ...(supabaseSettings.design_settings || {})
      }
    };

    // Save to localStorage for sync access
    localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('platformSettingsUpdated'));
  }
}

// Default values
const DEFAULT_SETTINGS: PlatformSettings = {
  legalDocuments: [
    {
      id: '1',
      type: 'terms',
      title: 'Terms of Service',
      description: 'Terms and conditions for using our Traditional Chinese Medicine platform',
      content: `TERMS OF SERVICE

Last Updated: April 5, 2026

1. ACCEPTANCE OF TERMS

By accessing and using this Traditional Chinese Medicine (TCM) clinical platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this platform.

2. PROFESSIONAL USE ONLY

This platform is designed exclusively for licensed healthcare professionals, TCM practitioners, and authorized medical personnel. By registering, you certify that you possess the necessary qualifications, licenses, and credentials to practice TCM in your jurisdiction.

3. CLINICAL INFORMATION AND LIABILITY

The information provided on this platform, including herb properties, formula compositions, and clinical applications, is for professional reference purposes only. While we strive for accuracy, this platform does not replace professional judgment, clinical experience, or the need to verify information from authoritative sources.

Users are solely responsible for:
- Verifying all clinical information before applying it to patient care
- Ensuring prescriptions are appropriate for individual patients
- Complying with local regulations and standards of practice
- Maintaining proper professional liability insurance

4. ACCOUNT SECURITY

You are responsible for:
- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Notifying us immediately of any unauthorized access
- Ensuring your account information remains current and accurate

5. INTELLECTUAL PROPERTY

All content on this platform, including but not limited to text, graphics, logos, formulas, and software, is the property of our organization or its content suppliers and is protected by intellectual property laws.

You may not:
- Reproduce, distribute, or create derivative works without permission
- Use automated systems to extract data from the platform
- Remove or modify any copyright or proprietary notices

6. DATA PRIVACY

We are committed to protecting your privacy and handling your data in accordance with our Privacy Policy and applicable data protection laws. By using this platform, you consent to our collection and use of information as described in our Privacy Policy.

7. PLATFORM MODIFICATIONS

We reserve the right to:
- Modify, suspend, or discontinue any aspect of the platform
- Update these Terms of Service at any time
- Restrict access to certain features or content

Continued use of the platform after changes constitutes acceptance of the modified terms.

8. PROHIBITED CONDUCT

You agree not to:
- Use the platform for any unlawful purpose
- Impersonate others or provide false information
- Interfere with the platform's operation or security
- Share your account with unauthorized individuals
- Upload malicious code or attempt unauthorized access

9. TERMINATION

We may suspend or terminate your account at any time for:
- Violation of these Terms of Service
- Fraudulent or illegal activities
- Extended periods of inactivity
- Any conduct that may harm the platform or other users

10. DISCLAIMER OF WARRANTIES

THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE UNINTERRUPTED ACCESS, ERROR-FREE OPERATION, OR THAT THE PLATFORM WILL MEET YOUR SPECIFIC REQUIREMENTS.

11. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.

12. GOVERNING LAW

These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.

13. CONTACT INFORMATION

For questions about these Terms of Service, please contact our support team through the platform's help system.

By clicking "Create Account" or continuing to use this platform, you acknowledge that you have read and agree to these Terms of Service.`,
      status: 'published',
      lastUpdated: new Date().toISOString(),
      visibleIn: ['footer', 'login']
    },
    {
      id: '2',
      type: 'privacy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information',
      content: `PRIVACY POLICY

Last Updated: April 5, 2026

1. INTRODUCTION

This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Traditional Chinese Medicine (TCM) clinical platform. We are committed to protecting your privacy and ensuring the security of your personal and professional data.

2. INFORMATION WE COLLECT

We collect information that you provide directly to us:

Personal Information:
- Name, email address, and professional credentials
- License numbers and certification details
- Contact information and professional affiliation
- Account preferences and settings

Professional Activity Data:
- Search queries and browsing history within the platform
- Prescription records and clinical notes (if applicable)
- Usage patterns and feature interactions
- Bookmarks, favorites, and saved content

Technical Information:
- IP address, browser type, and device information
- Log data, cookies, and similar tracking technologies
- Session duration and interaction timestamps
- Error reports and diagnostic data

3. HOW WE USE YOUR INFORMATION

We use collected information for:

Platform Operations:
- Providing and maintaining platform functionality
- Personalizing your user experience
- Authenticating your identity and managing your account
- Processing your requests and communications

Clinical Support:
- Improving herb and formula recommendations
- Enhancing search and filtering capabilities
- Developing new features based on usage patterns
- Ensuring safety checks and interaction warnings function properly

Communication:
- Sending important updates about the platform
- Responding to your inquiries and support requests
- Providing educational content and clinical resources
- Notifying you of relevant platform changes

Research and Development:
- Analyzing usage patterns to improve the platform
- Conducting research on TCM practices (anonymized)
- Testing new features and functionality
- Ensuring platform security and preventing abuse

4. DATA SHARING AND DISCLOSURE

We do not sell your personal information. We may share data only in these circumstances:

With Your Consent:
- When you explicitly authorize sharing
- For features requiring data exchange

Service Providers:
- Third-party vendors who assist in platform operation
- Cloud hosting and database management services
- Analytics and monitoring tools
- All providers are bound by confidentiality agreements

Legal Requirements:
- To comply with applicable laws and regulations
- In response to valid legal processes
- To protect our rights, property, or safety
- To prevent fraud or security threats

Business Transfers:
- In connection with mergers, acquisitions, or asset sales
- Your data would remain subject to existing privacy commitments

5. DATA SECURITY

We implement robust security measures:

Technical Safeguards:
- Encryption of data in transit and at rest
- Secure authentication mechanisms
- Regular security audits and vulnerability assessments
- Firewall protection and intrusion detection

Administrative Safeguards:
- Strict access controls and authorization procedures
- Employee training on data protection
- Regular review of security policies
- Incident response procedures

Physical Safeguards:
- Secure data center facilities
- Environmental controls and monitoring
- Backup and disaster recovery systems

6. DATA RETENTION

We retain your information for as long as:
- Your account remains active
- Necessary to provide platform services
- Required by legal or regulatory obligations
- Needed for legitimate business purposes

When data is no longer needed, we securely delete or anonymize it.

7. YOUR RIGHTS AND CHOICES

You have the right to:

Access and Control:
- Access your personal information
- Update or correct your data
- Download your information (data portability)
- Delete your account and associated data

Privacy Preferences:
- Opt-out of marketing communications
- Manage cookie preferences
- Control data sharing settings
- Request restrictions on processing

To exercise these rights, contact us through the platform's settings or support system.

8. COOKIES AND TRACKING

We use cookies and similar technologies for:
- Essential platform functionality
- Remembering your preferences
- Analyzing usage patterns
- Improving user experience

You can control cookies through your browser settings, though some platform features may be affected.

9. CHILDREN'S PRIVACY

This platform is not intended for individuals under 18 years of age. We do not knowingly collect information from minors.

10. INTERNATIONAL DATA TRANSFERS

If you access the platform from outside our primary jurisdiction, your information may be transferred to and processed in other countries with different privacy laws. We ensure appropriate safeguards are in place for such transfers.

11. CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy periodically. We will notify you of significant changes through:
- In-platform notifications
- Email announcements
- Updated "Last Updated" date

Continued use after changes indicates acceptance of the revised policy.

12. CONTACT US

For privacy-related questions or concerns:
- Use the platform's support system
- Review our help documentation
- Contact our privacy team through official channels

13. REGULATORY COMPLIANCE

We comply with applicable data protection regulations, including but not limited to GDPR, HIPAA (where applicable), and other relevant privacy laws.

By using this platform, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.`,
      status: 'published',
      lastUpdated: new Date().toISOString(),
      visibleIn: ['footer', 'login']
    },
    {
      id: '3',
      type: 'cookies',
      title: 'Cookies Policy',
      description: 'Information about cookies and tracking technologies we use',
      content: `COOKIES POLICY

Last Updated: April 29, 2026

1. INTRODUCTION

This Cookies Policy explains how Clinical TCM ("we," "us," or "our") uses cookies and similar tracking technologies on our Traditional Chinese Medicine clinical platform. By using our platform, you consent to the use of cookies in accordance with this policy.

2. WHAT ARE COOKIES?

Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

Types of cookies we use:
- Session cookies: Temporary cookies that expire when you close your browser
- Persistent cookies: Remain on your device for a set period or until manually deleted
- First-party cookies: Set by us directly
- Third-party cookies: Set by external services we use

3. HOW WE USE COOKIES

We use cookies for the following purposes:

NECESSARY COOKIES (Always Active)
Essential for the platform to function properly:
- Authentication and security
- Session management
- Account preferences
- Platform functionality
- Security features

You cannot disable these cookies as they are essential for the platform to work.

FUNCTIONAL COOKIES
Enhance your experience and remember your preferences:
- Language preferences
- Display settings (font size, theme)
- Saved filters and searches
- User interface customizations
- Dashboard layouts

ANALYTICS COOKIES
Help us understand how visitors use our platform:
- Page views and navigation patterns
- Feature usage statistics
- Performance monitoring
- Error tracking
- User behavior analysis (anonymized)

We use Google Analytics and similar tools. Data is anonymized and used solely to improve our platform.

MARKETING COOKIES
Used for advertising and personalization:
- Personalized content recommendations
- Targeted advertising
- Social media integration
- Cross-site tracking

4. COOKIES WE USE

Necessary Cookies:
- auth_token: Session authentication (expires: session)
- csrf_token: Security protection (expires: session)
- user_preferences: Account settings (expires: 1 year)

Functional Cookies:
- language_pref: Language selection (expires: 1 year)
- display_settings: UI preferences (expires: 1 year)
- saved_filters: Search preferences (expires: 30 days)

Analytics Cookies:
- _ga: Google Analytics ID (expires: 2 years)
- _gid: Google Analytics session (expires: 24 hours)
- _gat: Google Analytics throttle (expires: 1 minute)

Marketing Cookies:
- _fbp: Facebook Pixel (expires: 3 months)
- _gcl_au: Google Ads (expires: 3 months)

5. MANAGING COOKIES

You can control cookies through:

Browser Settings:
- Most browsers allow you to view, manage, and delete cookies
- You can usually block all cookies or block specific types
- Check your browser's "Help" menu for instructions

Cookie Preferences:
- Use our Cookie Preferences tool to customize your settings
- Access it through the Settings page or footer link
- Changes apply immediately

Opt-Out Tools:
- Google Analytics: https://tools.google.com/dlpage/gaoptout
- Network Advertising Initiative: https://optout.networkadvertising.org
- Digital Advertising Alliance: https://optout.aboutads.info

Please note: Disabling certain cookies may limit platform functionality.

6. DO NOT TRACK

Some browsers include a "Do Not Track" (DNT) feature. Our platform currently does not respond to DNT signals. We will update this policy if we implement DNT support in the future.

7. CHANGES TO THIS POLICY

We may update this Cookies Policy to reflect changes in technology or regulations. We will notify you of significant changes through the platform or via email.

8. MORE INFORMATION

For questions about our use of cookies, please contact our support team through the platform's help system.

Related Policies:
- Privacy Policy: Details on how we collect and use personal data
- Terms of Service: Rules for using our platform

By continuing to use our platform, you consent to our use of cookies as described in this policy.`,
      status: 'published',
      lastUpdated: '2026-04-29T00:00:00.000Z',
      visibleIn: ['footer']
    },
    {
      id: '4',
      type: 'refund',
      title: 'Refund Policy',
      description: 'Our policy regarding refunds, cancellations, and billing disputes',
      content: `REFUND POLICY

Last Updated: April 29, 2026

1. OVERVIEW

Clinical TCM is committed to customer satisfaction. This Refund Policy explains our policies regarding refunds, cancellations, and billing disputes for our Traditional Chinese Medicine clinical platform subscription services.

2. SUBSCRIPTION PLANS

We offer the following subscription plans:
- Free Plan: No charges, no refunds applicable
- Practitioner Plan: Monthly or annual subscription
- Advanced Plan: Monthly or annual subscription

3. REFUND ELIGIBILITY

14-Day Money-Back Guarantee:
- Applies to new subscriptions only (first-time purchases)
- Valid for 14 days from the initial purchase date
- Available for both monthly and annual plans
- Full refund of the subscription fee (100%)

To qualify for a refund:
- Request must be submitted within 14 days of purchase
- Account must not have violated our Terms of Service
- Must provide a valid reason for the refund request

4. NON-REFUNDABLE SITUATIONS

Refunds will NOT be granted in the following cases:
- Requests made after the 14-day period
- Subscription renewals (only initial purchase qualifies)
- Partial month/year refunds (we do not prorate)
- Account termination due to Terms of Service violations
- Change of mind after using the platform extensively
- Technical issues resolved by our support team
- Third-party service fees (payment processing fees)

5. CANCELLATION POLICY

You can cancel your subscription at any time:

Monthly Subscriptions:
- Cancel anytime before your next billing date
- Access continues until the end of the current billing cycle
- No refund for the current month
- No charges after cancellation

Annual Subscriptions:
- Cancel anytime before your renewal date
- Access continues until the end of the current year
- No refund for the remaining months
- No charges after cancellation

How to Cancel:
1. Log into your account
2. Go to Account → Membership & Billing
3. Click "Cancel Subscription"
4. Confirm cancellation
5. You will receive a confirmation email

6. REFUND PROCESS

To request a refund:
1. Contact support through the platform's help system
2. Provide your account email and subscription details
3. State the reason for your refund request
4. Our team will review within 2-3 business days
5. If approved, refund processed within 5-10 business days

Refund Method:
- Refunds are issued to the original payment method
- Credit card: 5-10 business days
- PayPal: 3-5 business days
- Bank transfer: 7-14 business days

7. BILLING DISPUTES

If you believe you were charged incorrectly:
1. Contact our support team immediately
2. Provide transaction details and explanation
3. We will investigate within 48 hours
4. Resolution provided within 5 business days

Common billing issues we can resolve:
- Duplicate charges
- Incorrect subscription tier charges
- Failed cancellation processing
- Unauthorized charges

8. DOWNGRADES AND UPGRADES

Downgrades:
- Take effect at the next billing cycle
- No refund for the current period
- Access to premium features until downgrade takes effect

Upgrades:
- Take effect immediately
- Charged the difference for the current period (prorated)
- Access to new features immediately

9. ANNUAL PLAN SPECIFICS

Annual Plan Benefits:
- Discounted rate compared to monthly billing
- One-year commitment
- 14-day money-back guarantee on initial purchase only

Important Notes:
- Cannot switch to monthly mid-year without losing discount
- No refunds for unused months if you cancel
- Renewal charge occurs automatically unless cancelled

10. EXCEPTIONS

We may make exceptions to this policy in cases of:
- Platform outages exceeding 48 hours
- Critical features not functioning as advertised
- Billing errors on our part
- Extraordinary circumstances (at our discretion)

11. PAYMENT PROCESSOR FEES

Please note:
- Payment processing fees (charged by Stripe/PayPal) are non-refundable
- These fees are deducted from your refund
- Typical fees: 2.9% + $0.30 per transaction

12. DATA RETENTION AFTER REFUND

Upon refund:
- Your account will be downgraded to Free Plan
- All data remains accessible on Free Plan
- Custom content you created is preserved
- Prescriptions and saved items remain available

13. CONTACT US

For refund requests or billing questions:
- Email: support@clinicaltcm.com (placeholder)
- Help Center: Available in platform Settings
- Response time: 24-48 hours

14. POLICY UPDATES

We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use after changes constitutes acceptance.

15. GOVERNING LAW

This Refund Policy is governed by the laws applicable to our Terms of Service, without regard to conflict of law principles.

By subscribing to our services, you acknowledge that you have read and agree to this Refund Policy.`,
      status: 'published',
      lastUpdated: '2026-04-29T00:00:00.000Z',
      visibleIn: ['footer']
    },
    {
      id: '5',
      type: 'disclaimer',
      title: 'Medical Disclaimer',
      description: 'Important information about the clinical use of this platform and professional responsibility',
      content: `MEDICAL DISCLAIMER

Last Updated: April 29, 2026

PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING THIS PLATFORM

1. PROFESSIONAL USE ONLY

Clinical TCM is a professional reference platform designed exclusively for:
- Licensed healthcare professionals
- Qualified Traditional Chinese Medicine (TCM) practitioners
- Authorized medical personnel
- Students under professional supervision

This platform is NOT intended for:
- Self-diagnosis by patients
- Self-treatment without professional guidance
- Use by unlicensed individuals to practice medicine
- Replacement of professional medical consultation

2. NOT MEDICAL ADVICE

IMPORTANT: The information provided on this platform is for professional reference purposes only and does NOT constitute medical advice, diagnosis, or treatment recommendations.

This platform provides:
- Educational content about TCM herbs and formulas
- Clinical reference information
- Historical and traditional usage data
- Research summaries and clinical studies
- Professional tools for practitioners

This platform does NOT provide:
- Personal medical advice
- Diagnosis of medical conditions
- Treatment plans for specific patients
- Prescription recommendations for individuals
- Emergency medical guidance

3. PROFESSIONAL RESPONSIBILITY

As a licensed healthcare professional using this platform, YOU are responsible for:

Clinical Decision-Making:
- Independently verifying all information before clinical application
- Exercising professional judgment in all patient care decisions
- Considering individual patient circumstances and contraindications
- Consulting authoritative sources and current medical literature
- Staying current with your profession's standards of practice

Patient Safety:
- Conducting thorough patient assessments
- Identifying contraindications and potential interactions
- Monitoring patient responses to treatment
- Adjusting treatment plans based on patient outcomes
- Maintaining appropriate professional liability insurance

Legal Compliance:
- Practicing within your scope of licensure
- Complying with local, state, and federal regulations
- Following your jurisdiction's prescribing requirements
- Maintaining proper documentation
- Adhering to professional ethics codes

4. ACCURACY AND COMPLETENESS

While we strive for accuracy, we cannot guarantee that all information is:
- Complete and up-to-date
- Error-free or without omissions
- Applicable to all clinical situations
- Free from typographical errors
- Verified by multiple authoritative sources

You must:
- Verify all information from multiple authoritative sources
- Cross-reference with current medical literature
- Consult with colleagues when uncertain
- Report any errors or discrepancies you discover
- Use clinical judgment to evaluate information quality

5. NO GUARANTEE OF RESULTS

We make no warranties or guarantees regarding:
- Treatment outcomes or efficacy
- Safety for specific patients
- Absence of adverse reactions
- Compatibility with other treatments
- Long-term effects or consequences

Clinical outcomes depend on numerous factors including:
- Individual patient characteristics
- Accuracy of diagnosis
- Proper treatment administration
- Patient compliance
- Concurrent medications and conditions
- Practitioner skill and experience

6. HERB AND FORMULA INFORMATION

The herb and formula information on this platform:

Sources:
- Compiled from classical TCM texts
- Modern research studies
- Clinical experience reports
- Historical usage documentation
- Peer-reviewed literature

Limitations:
- May not reflect the most current research
- Could contain variations in traditional applications
- Might not account for modern quality control standards
- May not address all potential interactions
- Could be based on varying herbal preparation methods

Your Responsibility:
- Verify herb quality and authenticity
- Ensure proper identification and sourcing
- Check for adulterants and contaminants
- Confirm appropriate preparation methods
- Monitor for adverse reactions
- Consider modern safety data

7. DRUG INTERACTIONS AND CONTRAINDICATIONS

The interaction and contraindication information provided:
- May not be comprehensive
- Could be based on limited research
- Might not cover all medications
- May not account for individual sensitivity
- Could miss rare or newly discovered interactions

Always:
- Conduct thorough medication reviews
- Consult drug interaction databases
- Consider individual patient factors
- Monitor for unexpected reactions
- Collaborate with other healthcare providers
- Document all treatments and interactions

8. SAFETY PROFILE TOOL

Our Safety Profile feature:
- Assists with identifying potential concerns
- Does NOT replace professional judgment
- May not identify all contraindications
- Should be used as one tool among many
- Requires verification with other sources

You remain fully responsible for:
- Patient safety screening
- Comprehensive assessment
- Final treatment decisions
- Ongoing monitoring
- Adverse event management

9. PREGNANCY AND PEDIATRIC USE

Special Caution Required:
- Pregnancy safety information may be incomplete
- Pediatric dosing requires special expertise
- Individual risk-benefit analysis is essential
- Consultation with specialists may be necessary
- Extra monitoring and caution are advised

Never rely solely on platform information for:
- Pregnant or breastfeeding patients
- Pediatric populations
- Geriatric patients with multiple conditions
- Patients with serious chronic diseases
- Immunocompromised individuals

10. EMERGENCY SITUATIONS

This platform is NOT for emergency use:
- Do not use for acute, life-threatening conditions
- Do not delay emergency medical treatment
- Do not substitute for emergency protocols
- Always follow emergency medical guidelines
- Refer to emergency services when appropriate

11. RESEARCH AND CLINICAL STUDIES

Research information on this platform:
- May be summarized or simplified
- Could be based on preliminary studies
- Might not reflect consensus views
- May require critical evaluation
- Should be verified with original sources

Quality of evidence varies:
- Some based on rigorous clinical trials
- Some from traditional use only
- Some from animal or in-vitro studies
- Some from case reports or anecdotal evidence

12. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

We are NOT liable for:
- Patient outcomes or adverse events
- Clinical decisions made using this platform
- Errors or omissions in the information
- Consequences of professional negligence
- Harm resulting from platform use
- Lost income or professional damages

Your professional liability insurance should cover:
- All clinical decisions and treatments
- Patient care and outcomes
- Professional errors and omissions
- Adverse events and complications

13. REGULATORY COMPLIANCE

You are responsible for ensuring:
- Compliance with FDA regulations (if applicable)
- Adherence to local herbal medicine laws
- Following controlled substance regulations
- Meeting licensing requirements
- Maintaining proper documentation
- Following scope of practice limitations

Different jurisdictions have different regulations regarding:
- TCM practice
- Herbal medicine prescribing
- Professional licensing
- Patient documentation requirements
- Informed consent

14. CONTINUING EDUCATION

This platform is a reference tool, not a substitute for:
- Formal education and training
- Continuing medical education (CME)
- Professional development
- Supervised clinical experience
- Mentorship and peer consultation

We encourage you to:
- Stay current with professional standards
- Pursue ongoing education
- Attend professional conferences
- Engage in peer review
- Participate in professional organizations

15. REPORTING ERRORS

If you identify errors, omissions, or safety concerns:
- Report immediately through our support system
- Provide specific details and sources
- Include relevant references
- Help us maintain quality and safety
- Contribute to platform improvement

16. UPDATES AND CHANGES

This disclaimer may be updated to reflect:
- Changes in medical knowledge
- New regulatory requirements
- Platform feature updates
- Legal considerations

Check for updates regularly and ensure you understand current terms.

17. ACCEPTANCE

By using this platform, you acknowledge that you:
- Are a qualified healthcare professional
- Have read and understood this disclaimer
- Accept full professional responsibility
- Will exercise independent clinical judgment
- Understand the limitations of this platform
- Agree to use information responsibly

18. FINAL STATEMENT

THIS PLATFORM IS A PROFESSIONAL REFERENCE TOOL ONLY.

ALWAYS PRIORITIZE PATIENT SAFETY AND EXERCISE INDEPENDENT PROFESSIONAL JUDGMENT.

For questions about this disclaimer, contact our support team through the platform's help system.`,
      status: 'published',
      lastUpdated: '2026-04-29T00:00:00.000Z',
      visibleIn: ['footer']
    }
  ],
  helpSupport: {
    helpCenterText: 'Welcome to Clinical TCM Help Center. Find answers to common questions and learn how to use the platform effectively.',
    faqs: [
      {
        id: '1',
        question: 'How do I create a new prescription?',
        answer: 'Navigate to the Builder section and follow the guided prescription creation process.',
        order: 0
      },
      {
        id: '2',
        question: 'How can I search for herbs?',
        answer: 'Use the Herbs section to browse and search the complete herbal database.',
        order: 1
      }
    ],
    supportEmail: 'support@clinicaltcm.com',
    documentationUrl: '',
    contactUrl: ''
  },
  companyInfo: {
    appName: 'Clinical TCM',
    legalCompanyName: 'Clinical TCM LLC',
    copyrightText: '© 2026 Clinical TCM. All rights reserved.',
    platformTagline: 'Professional healthcare platform for licensed TCM practitioners',
    country: '',
    websiteUrl: ''
  },
  branding: {
    primaryColor: '#0d9488',
    accentColor: '#14b8a6',
    logoUrl: '',
    appName: 'Clinical TCM',
    showAppName: true,
    compactLogoUrl: '',
    faviconUrl: ''
  },
  designSettings: {
    navigationIcons: {
      herbs: 'Leaf',
      formulas: 'Pill',
      prescriptions: 'FileText',
      builder: 'Beaker',
      promos: 'Tag',
      research: 'Microscope',
      courses: 'GraduationCap',
      news: 'Newspaper',
      community: 'Users'
    },
    alertIcons: {
      pregnancy: 'Baby',
      lactation: 'Milk',
      cautions: 'AlertTriangle',
      contraindications: 'AlertCircle',
      interactions: 'AlertTriangle',
      drugInteractions: 'Pill',
      herbInteractions: 'Leaf',
      toxicology: 'Skull',
      antagonisms: 'ShieldAlert',
      incompatibilities: 'ShieldAlert',
      allergens: 'Dna',
      herbDrugInteractions: 'Pill',
      herbHerbInteractions: 'Leaf',
      pregnancyWarning: 'AlertCircle'
    },
    alertColors: {
      pregnancy: { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' },
      lactation: { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' },
      cautions: { bg: '#fffbeb', border: '#fde68a', text: '#78350f', icon: '#f59e0b' },
      contraindications: { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' },
      interactions: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12', icon: '#ea580c' },
      drugInteractions: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', icon: '#2563eb' },
      herbInteractions: { bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d', icon: '#16a34a' },
      toxicology: { bg: '#fefce8', border: '#fef08a', text: '#713f12', icon: '#ca8a04' },
      antagonisms: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#dc2626' },
      incompatibilities: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#dc2626' },
      allergens: { bg: '#faf5ff', border: '#e9d5ff', text: '#581c87', icon: '#9333ea' },
      herbDrugInteractions: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12', icon: '#ea580c' },
      herbHerbInteractions: { bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12', icon: '#ea580c' },
      pregnancyWarning: { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' }
    },
    fonts: {
      primaryFont: 'inter',
      hanziFont: 'system'
    }
  },
  compliance: {
    medicalDisclaimer: 'This platform is intended for healthcare professionals only. The information provided is for clinical reference and should not replace professional medical judgment.',
    professionalUseNotice: 'Clinical TCM is a professional tool designed for licensed practitioners of Traditional Chinese Medicine. Use of this platform requires appropriate professional qualifications.',
    nonDiagnosticDisclaimer: 'This system is not intended to diagnose, treat, cure, or prevent any disease. All clinical decisions remain the responsibility of the healthcare provider.',
    enabled: true
  },
  authentication: {
    oauthProviders: {
      google: true,
      microsoft: false,
      apple: false
    },
    loginOptions: {
      allowEmailPassword: true,
      requireEmailVerification: true,
      enableTwoFactorAuth: false
    },
    registrationSettings: {
      allowNewUserRegistration: true,
      requireAdminApproval: false
    }
  },
  bannerSettings: {
    cooldownDaysAnswered: 1, // 1 day after completing a survey
    maxWeeklyImpacts: 3 // Maximum 3 banner interactions per week
  }
};

// CRUD operations
export function getPlatformSettings(): PlatformSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  
  try {
    const stored = localStorage.getItem(PLATFORM_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default settings to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        branding: {
          ...DEFAULT_SETTINGS.branding,
          ...parsed.branding
        },
        designSettings: {
          ...DEFAULT_SETTINGS.designSettings,
          ...parsed.designSettings,
          navigationIcons: {
            ...DEFAULT_SETTINGS.designSettings.navigationIcons,
            ...(parsed.designSettings?.navigationIcons || {})
          },
          customSvgs: {
            ...DEFAULT_SETTINGS.designSettings.customSvgs,
            ...(parsed.designSettings?.customSvgs || {})
          },
          alertIcons: {
            ...DEFAULT_SETTINGS.designSettings.alertIcons,
            ...(parsed.designSettings?.alertIcons || {})
          },
          customAlertSvgs: {
            ...DEFAULT_SETTINGS.designSettings.customAlertSvgs,
            ...(parsed.designSettings?.customAlertSvgs || {})
          },
          alertColors: {
            ...DEFAULT_SETTINGS.designSettings.alertColors,
            ...(parsed.designSettings?.alertColors || {})
          },
          fonts: {
            ...DEFAULT_SETTINGS.designSettings.fonts,
            ...(parsed.designSettings?.fonts || {})
          }
        }
      };
    }
  } catch (error) {
    console.error('Error loading platform settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function savePlatformSettings(settings: PlatformSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Save to localStorage immediately (for sync access)
    localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(settings));

    // Dispatch custom event to notify components in the same tab
    window.dispatchEvent(new Event('platformSettingsUpdated'));

    // Save to Supabase asynchronously (don't block)
    saveToSupabase(settings).catch(error => {
      console.error('Failed to save to Supabase:', error);
      // Don't throw - localStorage save already succeeded
    });
  } catch (error) {
    console.error('Error saving platform settings:', error);
  }
}

// Legal Documents
export function updateLegalDocument(documentId: string, updates: Partial<LegalDocument>): void {
  const settings = getPlatformSettings();
  const docIndex = settings.legalDocuments.findIndex(doc => doc.id === documentId);
  
  if (docIndex !== -1) {
    settings.legalDocuments[docIndex] = {
      ...settings.legalDocuments[docIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    savePlatformSettings(settings);
  }
}

export function publishLegalDocument(documentId: string): void {
  updateLegalDocument(documentId, { status: 'published' });
}

export function draftLegalDocument(documentId: string): void {
  updateLegalDocument(documentId, { status: 'draft' });
}

// Help & Support
export function updateHelpSupport(updates: Partial<HelpSupport>): void {
  const settings = getPlatformSettings();
  settings.helpSupport = {
    ...settings.helpSupport,
    ...updates
  };
  savePlatformSettings(settings);
}

export function addFAQ(question: string, answer: string): void {
  const settings = getPlatformSettings();
  const newFAQ: FAQ = {
    id: Date.now().toString(),
    question,
    answer,
    order: settings.helpSupport.faqs.length
  };
  settings.helpSupport.faqs.push(newFAQ);
  savePlatformSettings(settings);
}

export function updateFAQ(faqId: string, question: string, answer: string): void {
  const settings = getPlatformSettings();
  const faqIndex = settings.helpSupport.faqs.findIndex(faq => faq.id === faqId);
  
  if (faqIndex !== -1) {
    settings.helpSupport.faqs[faqIndex] = {
      ...settings.helpSupport.faqs[faqIndex],
      question,
      answer
    };
    savePlatformSettings(settings);
  }
}

export function deleteFAQ(faqId: string): void {
  const settings = getPlatformSettings();
  settings.helpSupport.faqs = settings.helpSupport.faqs.filter(faq => faq.id !== faqId);
  // Reorder remaining FAQs
  settings.helpSupport.faqs.forEach((faq, index) => {
    faq.order = index;
  });
  savePlatformSettings(settings);
}

export function reorderFAQs(faqIds: string[]): void {
  const settings = getPlatformSettings();
  const reorderedFAQs: FAQ[] = [];
  
  faqIds.forEach((id, index) => {
    const faq = settings.helpSupport.faqs.find(f => f.id === id);
    if (faq) {
      reorderedFAQs.push({ ...faq, order: index });
    }
  });
  
  settings.helpSupport.faqs = reorderedFAQs;
  savePlatformSettings(settings);
}

// Company Info
export function updateCompanyInfo(updates: Partial<CompanyInfo>): void {
  const settings = getPlatformSettings();
  settings.companyInfo = {
    ...settings.companyInfo,
    ...updates
  };
  savePlatformSettings(settings);
}

// Branding
export function updateBranding(updates: Partial<BrandingConfig>): void {
  const settings = getPlatformSettings();
  settings.branding = {
    ...settings.branding,
    ...updates
  };
  savePlatformSettings(settings);
}

// Compliance
export function updateCompliance(updates: Partial<ComplianceDisclaimer>): void {
  const settings = getPlatformSettings();
  settings.compliance = {
    ...settings.compliance,
    ...updates
  };
  savePlatformSettings(settings);
}

// Banner Settings
export function updateBannerSettings(updates: Partial<BannerSettings>): void {
  const settings = getPlatformSettings();
  settings.bannerSettings = {
    ...settings.bannerSettings,
    ...updates
  };
  savePlatformSettings(settings);
}

// Authentication
export function updateAuthentication(updates: Partial<AuthenticationConfig>): void {
  const settings = getPlatformSettings();
  settings.authentication = {
    ...settings.authentication,
    ...updates,
    oauthProviders: {
      ...settings.authentication.oauthProviders,
      ...(updates.oauthProviders || {})
    },
    loginOptions: {
      ...settings.authentication.loginOptions,
      ...(updates.loginOptions || {})
    },
    registrationSettings: {
      ...settings.authentication.registrationSettings,
      ...(updates.registrationSettings || {})
    }
  };
  savePlatformSettings(settings);
}

// Design Settings
export function updateDesignSettings(updates: Partial<DesignSettings>): void {
  const settings = getPlatformSettings();
  settings.designSettings = {
    ...settings.designSettings,
    ...updates,
    navigationIcons: {
      ...settings.designSettings.navigationIcons,
      ...(updates.navigationIcons || {})
    },
    customSvgs: {
      ...settings.designSettings.customSvgs,
      ...(updates.customSvgs || {})
    },
    alertIcons: {
      ...settings.designSettings.alertIcons,
      ...(updates.alertIcons || {})
    },
    customAlertSvgs: {
      ...settings.designSettings.customAlertSvgs,
      ...(updates.customAlertSvgs || {})
    },
    alertColors: {
      ...settings.designSettings.alertColors,
      ...(updates.alertColors || {})
    },
    fonts: {
      ...settings.designSettings.fonts,
      ...(updates.fonts || {})
    }
  };
  savePlatformSettings(settings);
}