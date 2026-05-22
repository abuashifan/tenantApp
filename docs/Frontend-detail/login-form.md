TASK:
Implement the new production-ready login form design in the frontend project.

PROJECT:
TenantAppDevelopment
Repository: abuashifan/tenantApp
Frontend path: frontend/
Stack:

- Next.js
- React
- TypeScript
- TailwindCSS
- API auth uses Laravel Sanctum token
- Active company uses X-Company-ID after login/select company

TARGET FILE:
Replace/update:

frontend/app/login/page.tsx

OPTIONAL SUPPORT FILES:
Only if needed:

- frontend/app/globals.css
- frontend/components/auth/LoginForm.tsx
- frontend/components/auth/LoginMarketingPanel.tsx

Do not over-split components unless it keeps the code cleaner.

IMPORTANT:
This task is only for the login page UI and existing login flow integration.

DO NOT:

- Do not change backend.
- Do not change API contracts.
- Do not change auth endpoint.
- Do not add reset password feature.
- Do not add forgot password route.
- Do not add create company feature.
- Do not change select-company flow.
- Do not change dashboard route.
- Do not modify AppShell unless login page currently imports it by mistake.
- Do not add Redux/Zustand or other state manager.
- Do not add chart library.
- Do not add unused packages.

DEPENDENCY:
Use lucide-react icons if already installed.

If lucide-react is not installed, install:

npm install lucide-react

Do not install framer-motion unless it already exists.
The canvas prototype uses framer-motion, but production implementation should avoid adding framer-motion just for login animation.
Use simple Tailwind transitions instead.

If framer-motion already exists in package.json, it may be used, but not required.

CURRENT LOGIN FLOW TO PRESERVE:
Study current:

frontend/app/login/page.tsx
frontend/lib/api.ts
frontend/types/auth.ts
frontend/types/company.ts

Preserve existing behavior:

1. User submits email/password.
2. POST /api/auth/login.
3. Store auth token in localStorage.
4. Fetch GET /api/companies.
5. If user has more than one company:
   - redirect to /select-company.
6. If user has exactly one company:
   - select/store active company if current implementation already does this.
   - redirect to /dashboard.
7. If active_company already exists according to existing logic:
   - redirect to /dashboard.
8. Show API validation/error messages correctly.
9. Do not break logout/select-company/dashboard.

API CLIENT RULE:
Use existing frontend/lib/api.ts helper.
Do not create a second API client.
Do not hardcode backend URL.
Do not bypass getStoredToken/getStoredCompanyId pattern.

LOCALSTORAGE RULE:
Follow current key names used in project:

- auth_token
- auth_user
- active_company_id
- active_company
- auth_permissions

Do not invent new key names unless existing code already uses them.

DESIGN REQUIREMENTS:
Implement layout based on the current approved canvas design.

Main layout:

- Full screen login page.
- Background uses soft gradients from the existing project palette.
- Desktop layout: 2 columns.
  - Left side: marketing hook and feature cards.
  - Right side: login card.
- Mobile layout:
  - Hide left marketing panel.
  - Login card centered and responsive.
- No dark footer under login card.
- No "Secure tenant session / Bearer + X-Company-ID" footer.
- No forgot password button/link.
- Forgot password information should be static text:
  "Lupa password? Hubungi administrator perusahaan untuk reset akses akun."

COLOR PALETTE:
Use only these brand colors plus neutral slate/white:

:root {
--color-lime-cream-50: #f7fbe9;
--color-lime-cream-100: #f0f8d3;
--color-lime-cream-200: #e1f1a7;
--color-lime-cream-300: #d2ea7b;
--color-lime-cream-400: #c3e250;
--color-lime-cream-500: #b4db24;
--color-lime-cream-600: #90af1d;
--color-lime-cream-700: #6c8415;
--color-lime-cream-800: #48580e;
--color-lime-cream-900: #242c07;
--color-lime-cream-950: #191f05;

--color-light-green-50: #eef9ec;
--color-light-green-100: #ddf2d9;
--color-light-green-200: #bbe6b3;
--color-light-green-300: #99d98c;
--color-light-green-400: #77cc66;
--color-light-green-500: #55bf40;
--color-light-green-600: #449933;
--color-light-green-700: #337326;
--color-light-green-800: #224d19;
--color-light-green-900: #11260d;
--color-light-green-950: #0c1b09;

--color-emerald-50: #edf8f1;
--color-emerald-100: #dbf0e2;
--color-emerald-200: #b6e2c5;
--color-emerald-300: #92d3a9;
--color-emerald-400: #6dc58c;
--color-emerald-500: #49b66f;
--color-emerald-600: #3a9259;
--color-emerald-700: #2c6d43;
--color-emerald-800: #1d492c;
--color-emerald-900: #0f2416;
--color-emerald-950: #0a1a10;

--color-ocean-mist-50: #edf7f5;
--color-ocean-mist-100: #dbf0ea;
--color-ocean-mist-200: #b7e1d5;
--color-ocean-mist-300: #93d2c0;
--color-ocean-mist-400: #6fc3ab;
--color-ocean-mist-500: #4bb496;
--color-ocean-mist-600: #3c9078;
--color-ocean-mist-700: #2d6c5a;
--color-ocean-mist-800: #1e483c;
--color-ocean-mist-900: #0f241e;
--color-ocean-mist-950: #0b1915;

--color-tropical-teal-50: #ecf8f9;
--color-tropical-teal-100: #d8f2f3;
--color-tropical-teal-200: #b1e5e7;
--color-tropical-teal-300: #8bd8da;
--color-tropical-teal-400: #64cbce;
--color-tropical-teal-500: #3dbdc2;
--color-tropical-teal-600: #31989b;
--color-tropical-teal-700: #257274;
--color-tropical-teal-800: #184c4e;
--color-tropical-teal-900: #0c2627;
--color-tropical-teal-950: #091b1b;

--color-cerulean-50: #e9f6fb;
--color-cerulean-500: #24a1db;

--color-yale-blue-900: #091c2a;
--color-yale-blue-950: #06131e;
}

Use CSS variables from globals.css if available.
If not available, add them to globals.css.
Do not create a separate color system.

APP NAME RULE:
The badge text currently says:
"Tenant Accounting ERP"

Do not hardcode this permanently as business logic.
Use a variable:

const appName = "Tenant Accounting ERP";

Add TODO comment:

// TODO production: ambil nilai ini dari data Nama Aplikasi / app settings.
// Contoh sumber nanti: company settings, environment config, atau endpoint settings aplikasi.

Later this should be replaced by application settings.

LEFT MARKETING PANEL COPY:
Use this exact copy:

Badge:
{appName}

Headline:
Kelola akuntansi bisnis tanpa ribet.

Description:
Satu aplikasi untuk mencatat transaksi, mengontrol approval, dan membaca laporan keuangan bisnis dengan lebih cepat.

Feature cards:

1. Title:
   Akun rapi dari hari pertama

Description:
Transaksi, jurnal, dan laporan disusun dalam satu workspace yang mudah dipakai.

Icon:
Building2

2. Title:
   Realtime report tanpa repot

Description:
Pantau laba rugi, neraca, arus kas, dan ringkasan keuangan tanpa buka banyak file.

Icon:
BarChart3

3. Title:
   Kontrol transaksi lebih aman

Description:
Approval, posting, audit trail, dan period lock membantu mengurangi salah input.

Icon:
ShieldCheck

LOGIN CARD COPY:
Small label:
Welcome Back

Title:
Login

Subtitle:
Masuk untuk membuka dashboard perusahaan aktif.

Fields:

- Email
- Password

Email placeholder:
email@company.com

Password placeholder:
••••••••

Button:
Login

Loading text:
Signing in...

Forgot password info:
Lupa password? Hubungi administrator perusahaan untuk reset akses akun.

Remember me:
Keep the checkbox visually, but only connect it if current login logic already supports it.
If current app does not use remember me, keep it as UI-only for now and add TODO comment.
Do not create new auth persistence logic unless already present.

FORM BEHAVIOR:

- Email input controlled state.
- Password input controlled state.
- Show/hide password toggle using Eye/EyeOff icon.
- Submit button disabled while loading.
- Button text becomes "Signing in..." while loading.
- Show clear error message if login fails.
- Do not keep prototype default values in production.
- Remove:
  defaultValue="admin@example.com"
  defaultValue="password"
- Empty initial values:
  email = ""
  password = ""

ACCESSIBILITY:

- Use proper label htmlFor and input id.
- Button type submit.
- Password toggle type button.
- Add aria-label to password toggle:
  "Tampilkan password" / "Sembunyikan password"
- Error message should use role="alert".
- Do not rely only on color for error.

VALIDATION:
Before sending request:

- email required
- password required

If empty:
Show friendly message:
"Email dan password wajib diisi."

Do not overbuild validation schema library.

ERROR STATES:
If API returns validation/auth error:

- Show message inside login card.
- Message should be visible above button or above form fields.
- Use soft red styling, not harsh full red page.

Example:

<div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
  {errorMessage}
</div>

SUCCESS FLOW:
Preserve current redirect logic from existing login page.
Do not replace with dummy setTimeout.
Do not use fake loading timer.

LOGIN LOGIC PSEUDOCODE:
async function handleSubmit(event) {
event.preventDefault();
setError(null);

if (!email || !password) {
setError("Email dan password wajib diisi.");
return;
}

setLoading(true);

try {
const loginResponse = await apiRequest<AuthResponse>("/auth/login", {
method: "POST",
body: { email, password },
});

    // Preserve existing response parsing.
    // Store token and user using existing keys.
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));

    const companiesResponse = await apiRequest<CompaniesResponse>("/companies", {
      token,
    });

    // Preserve existing company redirect behavior.
    if (companies.length === 1) {
      // use existing select company flow if current page already does this
      // store active company
      // redirect /dashboard
    } else {
      router.push("/select-company");
    }

} catch (error) {
setError(extractErrorMessage(error));
} finally {
setLoading(false);
}
}

IMPORTANT:
Use the existing code's exact response shape.
Do not guess new API response shape if current login page already parses it differently.
Study current file first and preserve working logic.

VISUAL STRUCTURE REFERENCE:
The final JSX should roughly follow this structure:

<main className="relative min-h-screen overflow-hidden p-4 text-slate-950 sm:p-6 lg:p-8">
  background gradient blobs

  <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden lg:block">
      marketing panel
    </section>

    <section className="mx-auto w-full max-w-md">
      <form className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
        card content
      </form>
    </section>

  </div>
</main>

LOGIN CARD STYLE:

- rounded-[2rem]
- border border-white/80
- bg-white/85
- shadow-2xl shadow-slate-950/10
- backdrop-blur-xl
- padding p-6 sm:p-8
- input wrapper rounded-2xl
- focus-within ring using tropical teal
- login button gradient lime to teal:
  linear-gradient(135deg, #b4db24, #3dbdc2)
- Button text dark slate/yale, not white.

BACKGROUND STYLE:
Use gradients:

- radial lime cream top left
- radial tropical teal/ocean top right
- linear lime cream to white to ocean mist

Example:
background:
radial-gradient(circle at 8% 12%, var(--color-lime-cream-100) 0, transparent 30%),
radial-gradient(circle at 92% 18%, var(--color-tropical-teal-100) 0, transparent 32%),
linear-gradient(135deg, var(--color-lime-cream-50), #ffffff 42%, var(--color-ocean-mist-50))

RESPONSIVE:

- Desktop: marketing left visible, login card right.
- Below lg: marketing section hidden.
- Login card centered.
- Page must not overflow horizontally.
- Mobile padding should be comfortable.

ICONS:
Use lucide-react:

- Sparkles for app badge
- Building2 for feature card 1
- BarChart3 for feature card 2
- ShieldCheck for feature card 3
- WalletCards for login card icon
- Mail for email field
- Lock for password field
- Eye / EyeOff for password visibility
- ArrowRight for login button icon

Do not import unused icons.

IMPLEMENTATION DETAIL:
If using CSS variables in style props:
Prefer classes and inline style only where Tailwind cannot handle CSS variable gradients cleanly.

Example acceptable:
style={{
  background: `linear-gradient(135deg, var(--color-lime-cream-500), var(--color-tropical-teal-500))`
}}

Do not use hardcoded colors outside the approved palette.

REMOVE FROM CURRENT/OLD LOGIN PAGE:

- Old plain card design
- Forgot password link/button
- Any reset password route link
- Footer text:
  "Secure tenant session"
  "Bearer + X-Company-ID"
- Prototype default credentials in input fields
- Any debug text intended for developers

SECURITY/UX:

- Do not show default password.
- Do not log token to console.
- Do not expose API errors as raw JSON.
- Do not show stack trace.
- Do not store password.
- Do not add "Forgot password?" link because reset password module does not exist.

FORGOT PASSWORD RULE:
Use only static helper note:

"Lupa password? Hubungi administrator perusahaan untuk reset akses akun."

This should be displayed inside a soft info box, not a clickable link.

TESTING:
Run:
npm run lint
npm run build

Manual check:

1. Open /login on desktop.
2. Marketing panel appears on left.
3. Login card appears on right.
4. Open /login on mobile width.
5. Marketing panel hidden, login card centered.
6. Submit empty form.
7. Shows "Email dan password wajib diisi."
8. Submit wrong login.
9. Shows auth error message.
10. Submit valid demo login.
11. Existing redirect flow still works:
    - /select-company if multiple companies
    - /dashboard if active company/one company according to existing logic.
12. Password eye toggle works.
13. Forgot password is static text only.
14. No footer "Secure tenant session / Bearer + X-Company-ID".
15. No reset password route/link.
16. No console errors.
17. No unused import warnings.

ACCEPTANCE CRITERIA:

- Login UI matches approved design.
- Colors stay inside uploaded palette.
- Existing auth flow still works.
- No backend changes.
- No reset password feature.
- No forgot password link.
- No default credentials in production inputs.
- npm run lint passes.
- npm run build passes.

FINAL SUMMARY REQUIRED:
After implementation, report:

- Files changed
- Dependency added if any
- Login flow preserved
- Commands run
- Any command failed
- Confirmation:
  - no backend changes
  - no reset password feature
  - forgot password replaced with administrator contact note

COMMIT MESSAGE:
feat(frontend): redesign login page with branded accounting layout
