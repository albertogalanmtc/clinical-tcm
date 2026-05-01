import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CookieBanner } from "./components/CookieBanner";
import Layout from "./components/Layout";
import AccountLayout from "./layouts/AccountLayout";
import AdminLayout from "./layouts/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import MembershipPage from "./pages/MembershipPage";
import SettingsPage from "./pages/SettingsPage";
import Usage from "./pages/Usage";
import HelpSupportPage from "./pages/HelpSupportPage";
import LegalPoliciesPage from "./pages/LegalPoliciesPage";
import Herbs from "./pages/Herbs";
import HerbDetail from "./pages/HerbDetail";
import EditHerb from "./pages/EditHerb";
import Formulas from "./pages/Formulas";
import FormulaDetail from "./pages/FormulaDetail";
import EditFormula from "./pages/EditFormula";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionDetail from "./pages/PrescriptionDetail";
import Builder from "./pages/Builder";
import News from "./pages/News";
import Community from "./pages/Community";
import CommunityNewPost from "./pages/CommunityNewPost";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlanManagement from "./pages/AdminPlanManagement";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminUserFormulas from "./pages/AdminUserFormulas";
import AdminUserHerbs from "./pages/AdminUserHerbs";
import AdminUserCompounds from "./pages/AdminUserCompounds";
import AdminTotalUsers from "./pages/AdminTotalUsers";
import AdminActiveSubscriptions from "./pages/AdminActiveSubscriptions";
import AdminNewUsers from "./pages/AdminNewUsers";
import AdminPrescriptionsGenerated from "./pages/AdminPrescriptionsGenerated";
import AdminHerbsUsed from "./pages/AdminHerbsUsed";
import AdminFormulasUsed from "./pages/AdminFormulasUsed";
import AdminContent from "./pages/AdminContent";
import AdminEditHerb from "./pages/AdminEditHerb";
import AdminEditFormula from "./pages/AdminEditFormula";
import AdminUsageAnalytics from "./pages/AdminUsageAnalytics";
import AdminHerbsUsage from "./pages/AdminHerbsUsage";
import AdminFormulasUsageList from "./pages/AdminFormulasUsageList";
import AdminCommunity from "./pages/AdminCommunity";
import NotFound from "./pages/NotFound";
import RedirectToAdminContent from "./pages/RedirectToAdminContent";
import AdminRedirect from "./pages/AdminRedirect";
import AccountRedirect from "./pages/AccountRedirect";
import AdminDashboardOrganization from "./pages/AdminDashboardOrganization";
import AdminDashboardContentHub from "./pages/AdminDashboardContentHub";
import AdminDashboardMessages from "./pages/AdminDashboardMessages";
import AdminDashboardImages from "./pages/AdminDashboardImages";
import AdminDashboardNews from "./pages/AdminDashboardNews";
import AdminDashboardBanners from "./pages/AdminDashboardBanners";
import AdminDashboardSurveys from "./pages/AdminDashboardSurveys";
import PlatformSettings from "./pages/PlatformSettings";
import AdvancedFiltersManager from "./pages/AdvancedFiltersManager";
import AdminDesignSettings from "./pages/AdminDesignSettings";
import CategoryColorsPreview from "./pages/CategoryColorsPreview";
import HelpCenter from "./pages/HelpCenter";
import LegalDocument from "./pages/LegalDocument";
import Legal from "./pages/Legal";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import AccountHub from "./pages/AccountHub";
import CompleteProfile from "./pages/CompleteProfile";
import SelectMembership from "./pages/SelectMembership";
import PaymentSuccess from "./pages/PaymentSuccess";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import PricingPlans from "./pages/PricingPlans";
import TestSupabase from "./pages/TestSupabase";
import OnboardingSurvey from "./pages/OnboardingSurvey";
import TestSupabaseConnection from "./pages/TestSupabaseConnection";
import TestSurveysTable from "./pages/TestSurveysTable";
import CreateSurveysTables from "./pages/CreateSurveysTables";
import CreateBannerDismissalsTable from "./pages/CreateBannerDismissalsTable";
import CreateUserDataViews from "./pages/CreateUserDataViews";
import CreateAdminUser from "./pages/CreateAdminUser";
import DebugSurveys from "./pages/DebugSurveys";
import DebugSurveysData from "./pages/DebugSurveysData";
import DebugUserInfo from "./pages/DebugUserInfo";
import DebugCommunityPosts from "./pages/DebugCommunityPosts";
import TestSurveyDisplay from "./pages/TestSurveyDisplay";
import ConfirmDeletionPage from "./pages/ConfirmDeletionPage";
import SetupDatabase from "./pages/SetupDatabase";
import TestUpgradeModal from "./pages/TestUpgradeModal";
import Landing from "./pages/Landing";
import { getPlatformSettings, initializePlatformSettings } from "./data/platformSettings";
import { initializeDashboardContent } from "./services/dashboardContentService";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import "./data/resetCommunityData"; // Make reset function available globally

// Helper function to convert hex to RGB
function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(
          Math.max(0, Math.min(255, x)),
        ).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Helper function to convert RGB to HSL
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Helper function to convert HSL to RGB
function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

// Helper function to apply semantic colors from action primary color
function applySemanticColors(actionPrimaryColor: string) {
  const root = document.documentElement;
  const rgb = hexToRgb(actionPrimaryColor);

  if (!rgb) return;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Action Primary tokens
  root.style.setProperty(
    "--action-primary-default",
    actionPrimaryColor,
  );

  // Hover: 15% darker
  const hoverRgb = hslToRgb(
    hsl.h,
    hsl.s,
    Math.max(0, hsl.l - 15),
  );
  root.style.setProperty(
    "--action-primary-hover",
    rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
  );

  // Active: 25% darker
  const activeRgb = hslToRgb(
    hsl.h,
    hsl.s,
    Math.max(0, hsl.l - 25),
  );
  root.style.setProperty(
    "--action-primary-active",
    rgbToHex(activeRgb.r, activeRgb.g, activeRgb.b),
  );

  // Disabled: 60% lighter, 50% less saturated
  const disabledRgb = hslToRgb(
    hsl.h,
    Math.max(0, hsl.s - 50),
    Math.min(100, hsl.l + 60),
  );
  root.style.setProperty(
    "--action-primary-disabled",
    rgbToHex(disabledRgb.r, disabledRgb.g, disabledRgb.b),
  );

  // Navigation Item tokens (softer tonal variations)
  // Default: Very light (90% lightness), desaturated (40% saturation)
  const navDefaultRgb = hslToRgb(
    hsl.h,
    Math.min(40, hsl.s),
    90,
  );
  root.style.setProperty(
    "--nav-item-default",
    rgbToHex(navDefaultRgb.r, navDefaultRgb.g, navDefaultRgb.b),
  );

  // Hover: Light (80% lightness), slightly more saturated
  const navHoverRgb = hslToRgb(hsl.h, Math.min(50, hsl.s), 80);
  root.style.setProperty(
    "--nav-item-hover",
    rgbToHex(navHoverRgb.r, navHoverRgb.g, navHoverRgb.b),
  );

  // Active: Medium (70% lightness), more saturated
  const navActiveRgb = hslToRgb(hsl.h, Math.min(60, hsl.s), 70);
  root.style.setProperty(
    "--nav-item-active",
    rgbToHex(navActiveRgb.r, navActiveRgb.g, navActiveRgb.b),
  );

  // Text for navigation: Darker (30% lightness), full saturation
  const navTextRgb = hslToRgb(hsl.h, Math.min(80, hsl.s), 30);
  root.style.setProperty(
    "--nav-item-text",
    rgbToHex(navTextRgb.r, navTextRgb.g, navTextRgb.b),
  );

  // Surface selected uses the same as nav-item-default
  root.style.setProperty(
    "--surface-selected",
    rgbToHex(navDefaultRgb.r, navDefaultRgb.g, navDefaultRgb.b),
  );
}

// Helper function to apply brand colors to CSS variables (legacy)
function applyBrandColors(
  primaryColor: string,
  accentColor: string,
) {
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", primaryColor);
  root.style.setProperty("--brand-accent", accentColor);

  // Calculate darker shade for hover (roughly 10% darker)
  try {
    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const darkerR = Math.max(0, Math.floor(r * 0.85));
    const darkerG = Math.max(0, Math.floor(g * 0.85));
    const darkerB = Math.max(0, Math.floor(b * 0.85));

    const hoverColor = `#${darkerR.toString(16).padStart(2, "0")}${darkerG.toString(16).padStart(2, "0")}${darkerB.toString(16).padStart(2, "0")}`;
    root.style.setProperty("--brand-primary-hover", hoverColor);
  } catch (e) {
    // Fallback if color calculation fails
    root.style.setProperty(
      "--brand-primary-hover",
      primaryColor,
    );
  }
}

export default function App() {
  // Initialize platform settings and dashboard content from Supabase on mount
  useEffect(() => {
    // Initialize in parallel
    Promise.all([
      initializePlatformSettings(),
      initializeDashboardContent(),
    ]).catch(error => {
      console.error('Failed to initialize from Supabase:', error);
      // Continue with localStorage if Supabase fails
    });
  }, []);

  // Fix admin user plan on mount
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const currentPlan = localStorage.getItem("userPlanType");

    // If user is admin and plan is not set to 'pro', fix it
    if (userRole === "admin" && currentPlan !== "pro") {
      localStorage.setItem("userPlanType", "pro");
      console.log("Admin plan updated to: pro");
    }
  }, []);

  // Load platform settings and apply brand colors on mount
  useEffect(() => {
    // Apply font settings
    const applyFonts = (
      settings: ReturnType<typeof getPlatformSettings>,
    ) => {
      const { primaryFont, hanziFont } =
        settings.designSettings.fonts;

      // Apply primary font (for Latin/English text)
      let primaryFontFamily =
        '\'Inter\', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
      if (primaryFont === "system") {
        primaryFontFamily =
          'ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"';
      } else if (primaryFont === "noto-sans") {
        primaryFontFamily = "'Noto Sans', sans-serif";
      } else if (primaryFont === "noto-serif") {
        primaryFontFamily = "'Noto Serif', serif";
      }

      // Apply Hanzi font (for Chinese characters)
      let hanziFontFamily =
        'ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"';
      if (hanziFont === "noto-sans-sc") {
        hanziFontFamily = "'Noto Sans SC', sans-serif";
      } else if (hanziFont === "noto-serif-sc") {
        hanziFontFamily = "'Noto Serif SC', serif";
      }

      // Set CSS custom properties
      document.documentElement.style.setProperty(
        "--font-primary",
        primaryFontFamily,
      );
      document.documentElement.style.setProperty(
        "--font-hanzi",
        hanziFontFamily,
      );

      // Apply primary font to body (hanzi font is applied via .font-hanzi class only)
      document.body.style.fontFamily = primaryFontFamily;
    };

    const settings = getPlatformSettings();
    applyBrandColors(
      settings.branding.primaryColor,
      settings.branding.accentColor,
    );
    applySemanticColors(settings.branding.primaryColor);
    applyFonts(settings);

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      const updatedSettings = getPlatformSettings();
      applyBrandColors(
        updatedSettings.branding.primaryColor,
        updatedSettings.branding.accentColor,
      );
      applySemanticColors(
        updatedSettings.branding.primaryColor,
      );
      applyFonts(updatedSettings);
    };

    window.addEventListener(
      "platformSettingsUpdated",
      handleSettingsUpdate,
    );
    return () =>
      window.removeEventListener(
        "platformSettingsUpdated",
        handleSettingsUpdate,
      );
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppErrorBoundary>
        <UserProvider>
          <Routes>
          <Route path="/" element={<Landing />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />
          <Route
            path="/complete-profile"
            element={<CompleteProfile />}
          />
          <Route
            path="/select-membership"
            element={<SelectMembership />}
          />
          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />
          <Route
            path="/create-account"
            element={<CreateAccount />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/pricing-plans"
            element={<PricingPlans />}
          />
          <Route
            path="/confirm-deletion"
            element={<ConfirmDeletionPage />}
          />
          <Route
            path="/setup-database"
            element={<SetupDatabase />}
          />
          <Route
            path="/create-user-data-views"
            element={<CreateUserDataViews />}
          />
          <Route
            path="/create-admin-user"
            element={<CreateAdminUser />}
          />
          <Route
            path="/test-supabase"
            element={<TestSupabaseConnection />}
          />
          <Route
            path="/test-surveys"
            element={<TestSurveysTable />}
          />
          <Route
            path="/create-surveys-tables"
            element={<CreateSurveysTables />}
          />
          <Route
            path="/create-banner-dismissals-table"
            element={<CreateBannerDismissalsTable />}
          />
          <Route
            path="/debug-surveys"
            element={<DebugSurveys />}
          />
          <Route
            path="/debug-surveys-data"
            element={<DebugSurveysData />}
          />
          <Route
            path="/debug-user-info"
            element={<DebugUserInfo />}
          />
          <Route
            path="/debug-community-posts"
            element={<DebugCommunityPosts />}
          />
          <Route
            path="/test-survey-display"
            element={<TestSurveyDisplay />}
          />
          <Route
            path="/test-upgrade-modal"
            element={<TestUpgradeModal />}
          />
          <Route
            path="/onboarding-survey"
            element={<OnboardingSurvey />}
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/app" element={<Dashboard />} />
            <Route
              path="account-hub"
              element={<AccountHub />}
            />

            {/* Account Routes with Sidebar Layout */}
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<AccountRedirect />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route
                path="membership"
                element={<MembershipPage />}
              />
              <Route path="usage" element={<Usage />} />
              <Route
                path="settings"
                element={<SettingsPage />}
              />
              <Route
                path="help"
                element={<HelpSupportPage />}
              />
              <Route
                path="legal"
                element={<LegalPoliciesPage />}
              />
            </Route>

            <Route
              path="herbs/:herbName/edit"
              element={<EditHerb />}
            />
            <Route
              path="herbs/:herbName"
              element={<HerbDetail />}
            />
            <Route path="herbs" element={<Herbs />} />
            <Route
              path="formulas/:formulaName"
              element={<FormulaDetail />}
            />
            <Route
              path="formulas/:formulaId/edit"
              element={<EditFormula />}
            />
            <Route path="formulas" element={<Formulas />} />
            <Route
              path="prescriptions"
              element={<Prescriptions />}
            />
            <Route
              path="prescriptions/:id"
              element={<PrescriptionDetail />}
            />
            <Route path="builder" element={<Builder />} />
            <Route path="news" element={<News />} />
            <Route path="community" element={<Community />} />
            <Route
              path="community/new"
              element={<CommunityNewPost />}
            />
            <Route
              path="community/post/:postId"
              element={<CommunityPostDetail />}
            />

            {/* Admin Routes with Sidebar Layout */}
            <Route
              path="admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminRedirect />} />
              <Route
                path="dashboard"
                element={<AdminDashboard />}
              />
              <Route
                path="content"
                element={<AdminContent />}
              />
              <Route
                path="content/herbs/:herbId/edit"
                element={<AdminEditHerb />}
              />
              <Route
                path="content/formulas/:formulaId/edit"
                element={<AdminEditFormula />}
              />
              <Route
                path="content/*"
                element={<RedirectToAdminContent />}
              />
              <Route path="users" element={<AdminUsers />} />
              <Route
                path="users/:userId"
                element={<AdminUserDetail />}
              />
              <Route
                path="users/:userId/formulas"
                element={<AdminUserFormulas />}
              />
              <Route
                path="users/:userId/herbs"
                element={<AdminUserHerbs />}
              />
              <Route
                path="users/:userId/compounds"
                element={<AdminUserCompounds />}
              />
              <Route
                path="community"
                element={<AdminCommunity />}
              />
              <Route
                path="plan-management"
                element={<AdminPlanManagement />}
              />
              <Route
                path="advanced-filters"
                element={<AdvancedFiltersManager />}
              />
              <Route
                path="design-settings"
                element={<AdminDesignSettings />}
              />
              <Route
                path="usage-analytics"
                element={<AdminUsageAnalytics />}
              />
              <Route
                path="usage-analytics/herbs"
                element={<AdminHerbsUsage />}
              />
              <Route
                path="usage-analytics/formulas"
                element={<AdminFormulasUsageList />}
              />
              <Route
                path="dashboard-content"
                element={<AdminDashboardContentHub />}
              />
              <Route
                path="dashboard-organization"
                element={<AdminDashboardOrganization />}
              />
              <Route
                path="dashboard-content/messages"
                element={<AdminDashboardMessages />}
              />
              <Route
                path="dashboard-content/images"
                element={<AdminDashboardImages />}
              />
              <Route
                path="dashboard-content/news"
                element={<AdminDashboardNews />}
              />
              <Route
                path="dashboard-content/banners"
                element={<AdminDashboardBanners />}
              />
              <Route
                path="dashboard-content/surveys"
                element={<AdminDashboardSurveys />}
              />
              <Route
                path="settings"
                element={<PlatformSettings />}
              />
              <Route
                path="stats/total-users"
                element={<AdminTotalUsers />}
              />
              <Route
                path="stats/active-subscriptions"
                element={<AdminActiveSubscriptions />}
              />
              <Route
                path="stats/new-users"
                element={<AdminNewUsers />}
              />
              <Route
                path="stats/prescriptions-generated"
                element={<AdminPrescriptionsGenerated />}
              />
              <Route
                path="stats/herbs-used"
                element={<AdminHerbsUsed />}
              />
              <Route
                path="stats/formulas-used"
                element={<AdminFormulasUsed />}
              />
            </Route>

            <Route path="help" element={<HelpCenter />} />
            <Route
              path="category-colors-preview"
              element={<CategoryColorsPreview />}
            />
            <Route
              path="legal/:docType"
              element={<LegalDocument />}
            />
            <Route path="legal" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          </Routes>
        </UserProvider>
      </AppErrorBoundary>
        <CookieBanner />
    </BrowserRouter>
  );
}

// App version: 1.3.0-google-oauth
