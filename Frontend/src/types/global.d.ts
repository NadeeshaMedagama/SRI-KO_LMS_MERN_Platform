// Global window interface extension for Choreo deployment
declare global {
  interface Window {
    configs?: {
      apiUrl?: string;
      featureFlags?: {
        enableNewFeature?: boolean;
        enableExperimentalFeature?: boolean;
      };
    };
  }
}

export {};
