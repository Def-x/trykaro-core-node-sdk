export const resolveApiBaseUrl = ({ apiBaseUrl, config } = {}) => {
  const resolvedApiBaseUrl =
    apiBaseUrl ??
    config?.apiBaseUrl ??
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!resolvedApiBaseUrl) {
    throw new Error("API base URL is not configured");
  }

  return resolvedApiBaseUrl;
};

export const resolveOrganizationId = ({ orgId, config } = {}) => {
  return (
    orgId ??
    config?.orgId ??
    process.env.ORG_ID ??
    process.env.NEXT_PUBLIC_ORG_ID ??
    process.env.NEXT_PUBLIC_ORGANIZATION_ID ??
    null
  );
};

export const resolveCoreConfigValues = (options = {}) => ({
  apiBaseUrl: resolveApiBaseUrl(options),
  orgId: resolveOrganizationId(options),
  config: options.config,
});
