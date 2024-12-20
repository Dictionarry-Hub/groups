// src/hooks/useExport.ts
import { useState, useCallback } from "react";

interface SingleFormatConfig {
  name: string;
  includeCustomFormatWhenRenaming: boolean;
  specifications: {
    name: string;
    implementation: string;
    negate: boolean;
    required: boolean;
    fields: {
      value: string;
    };
  }[];
}

export const useExport = () => {
  const [copied, setCopied] = useState(false);

  const createSingleFormat = useCallback(
    (groupName: string): SingleFormatConfig => ({
      name: groupName,
      includeCustomFormatWhenRenaming: false,
      specifications: [
        {
          name: groupName,
          implementation: "ReleaseGroupSpecification",
          negate: false,
          required: true,
          fields: {
            value: `(?<=^|[\\s.-])${groupName}\\b`,
          },
        },
      ],
    }),
    []
  );

  const createTierFormat = useCallback(
    (
      resolution: string,
      tier: string,
      groups: string[]
    ): SingleFormatConfig => ({
      name: `${resolution} Tier ${tier}`,
      includeCustomFormatWhenRenaming: false,
      specifications: groups.map((groupName) => ({
        name: groupName,
        implementation: "ReleaseGroupSpecification",
        negate: false,
        required: false,
        fields: {
          value: `(?<=^|[\\s.-])${groupName}\\b`,
        },
      })),
    }),
    []
  );

  const copyToClipboard = useCallback(async (data: SingleFormatConfig) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  }, []);

  return {
    copied,
    createSingleFormat,
    createTierFormat,
    copyToClipboard,
  };
};
