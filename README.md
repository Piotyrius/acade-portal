# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b4285722-fa77-4da5-a105-d3d291a84970

## Internationalization (i18n)

- **Default language**: Georgian (`ka`)
- **Additional language**: Russian (`ru`)
- **Library**: `react-i18next` / `i18next`

- **Core setup**:
  - Initialization in `src/i18n.ts`
  - Resources in `src/locales/ka/common.json` and `src/locales/ru/common.json`
  - Loaded once from `src/main.tsx` via `import "./i18n"`

- **Usage in components**:
  - Import the hook:
    - `import { useTranslation } from "react-i18next";`
  - Use in component:
    - `const { t } = useTranslation("common");`
    - Replace hard-coded strings with translation keys, e.g.:
      - `t("auth.loginTitle")`
      - `t("layout.profileLabel")`

- **Adding new strings**:
  - Add the same key to both `common.json` files (`ka` and `ru`).
  - Use a dot-separated namespace, e.g.:
    - Auth-related: `auth.*`
    - Layout/sidebar/topbar: `layout.*`
    - Dashboard: `dashboard.*`

- **Language switching**:
  - The global switcher is implemented in `src/components/LanguageSwitcher.tsx`.
  - Rendered in the top bar (`Topbar` component).
  - Calls `i18n.changeLanguage("ka" | "ru")` and stores the choice in `localStorage`.
  - On first load, the app falls back to Georgian if nothing is stored.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b4285722-fa77-4da5-a105-d3d291a84970) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b4285722-fa77-4da5-a105-d3d291a84970) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
