/* eslint-disable @typescript-eslint/no-explicit-any */
// Clerk appearance config — kept for reference but not used in v7 Clerk
// Styling is handled via CSS overrides in globals.css
export const clerkAppearance: any = {
  variables: {
    colorPrimary: "#14b8a6",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#1a1917",
    colorInputText: "#1a1917",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "#14b8a6",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "0.625rem 1.25rem",
      textTransform: "none",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#0d9488",
        boxShadow: "none",
      },
      "&:active": {
        transform: "scale(0.97)",
      },
    },
    formButtonSecondary: {
      backgroundColor: "#f0eeeb",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "0.625rem 1.25rem",
      textTransform: "none",
      color: "#1a1917",
      border: "1px solid #e2dfdb",
      "&:hover": {
        backgroundColor: "#e2dfdb",
      },
    },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      border: "1px solid #e2dfdb",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "0.625rem 1.25rem",
      textTransform: "none",
      color: "#1a1917",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#f0eeeb",
        boxShadow: "none",
      },
    },
    formFieldInput: {
      backgroundColor: "#ffffff",
      border: "1px solid #e2dfdb",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      padding: "0.625rem 0.875rem",
      color: "#1a1917",
      boxShadow: "none",
      "&:focus": {
        borderColor: "#14b8a6",
        boxShadow: "0 0 0 2px rgba(20, 184, 166, 0.15)",
      },
    },
    formFieldLabel: {
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: "#6b6560",
    },
    headerTitle: {
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#1a1917",
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      fontSize: "0.875rem",
      color: "#6b6560",
    },
    dividerLine: {
      backgroundColor: "#e2dfdb",
    },
    dividerText: {
      fontSize: "0.75rem",
      color: "#6b6560",
    },
    footerActionLink: {
      fontSize: "0.8125rem",
      color: "#14b8a6",
      fontWeight: 500,
      "&:hover": {
        color: "#0d9488",
      },
    },
    formFieldSuccessText: {
      color: "#14b8a6",
    },
    formFieldErrorText: {
      color: "#dc2626",
    },
    identityPreviewEditButton: {
      color: "#14b8a6",
    },
    verifySlugSuccessPrimaryButton: {
      backgroundColor: "#14b8a6",
    },
  },
};

export const clerkAppearanceDark: any = {
  variables: {
    colorPrimary: "#14b8a6",
    colorBackground: "#161616",
    colorInputBackground: "#1e1e1e",
    colorText: "#ede8e3",
    colorInputText: "#ede8e3",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "#14b8a6",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "0.625rem 1.25rem",
      textTransform: "none",
      boxShadow: "none",
      color: "#0e0e0e",
      "&:hover": {
        backgroundColor: "#0d9488",
        boxShadow: "none",
      },
      "&:active": {
        transform: "scale(0.97)",
      },
    },
    formButtonSecondary: {
      backgroundColor: "#1e1e1e",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "0.625rem 1.25rem",
      textTransform: "none",
      color: "#ede8e3",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      "&:hover": {
        backgroundColor: "#2a2a2a",
      },
    },
    socialButtonsBlockButton: {
      backgroundColor: "#1e1e1e",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "0.625rem 1.25rem",
      textTransform: "none",
      color: "#ede8e3",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#2a2a2a",
        boxShadow: "none",
      },
    },
    formFieldInput: {
      backgroundColor: "#1e1e1e",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      padding: "0.625rem 0.875rem",
      color: "#ede8e3",
      boxShadow: "none",
      "&:focus": {
        borderColor: "#14b8a6",
        boxShadow: "0 0 0 2px rgba(20, 184, 166, 0.15)",
      },
    },
    formFieldLabel: {
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: "#8a8580",
    },
    headerTitle: {
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#ede8e3",
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      fontSize: "0.875rem",
      color: "#8a8580",
    },
    dividerLine: {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
    },
    dividerText: {
      fontSize: "0.75rem",
      color: "#8a8580",
    },
    footerActionLink: {
      fontSize: "0.8125rem",
      color: "#14b8a6",
      fontWeight: 500,
      "&:hover": {
        color: "#5eead4",
      },
    },
    formFieldSuccessText: {
      color: "#14b8a6",
    },
    formFieldErrorText: {
      color: "#ef4444",
    },
    card: {
      backgroundColor: "#161616",
      border: "1px solid rgba(255, 255, 255, 0.06)",
    },
    rootBox: {
      boxShadow: "none",
    },
  },
};
