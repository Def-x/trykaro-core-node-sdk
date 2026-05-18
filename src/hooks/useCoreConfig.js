"use client";

import { useCore } from "../context/CoreProvider";
import { resolveApiBaseUrl, resolveOrganizationId } from "../utils/coreConfig";

export const useCoreConfig = () => {
  const { config } = useCore();

  return {
    config,
    apiBaseUrl: resolveApiBaseUrl({ config }),
    orgId: resolveOrganizationId({ config }),
  };
};
