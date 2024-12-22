import { useEffect, useState } from "react";
import yaml from "js-yaml";

type Resolution = "2160p" | "1080p" | "720p" | "SD";

export interface Group {
  name: string;
  hasManualRank: boolean;
  hasPopularRank: boolean;
}

export interface GroupsByResolution {
  "2160p": Record<number, Group[]>;
  "1080p": Record<number, Group[]>;
  "720p": Record<number, Group[]>;
  SD: Record<number, Group[]>;
}

interface CacheItem {
  timestamp: number;
  data: GroupsByResolution;
}

const CACHE_KEY = "local_yml_cache";
const CACHE_DURATION = 30 * 60 * 1000;

const extractResolutionAndTier = (
  tags: string[]
): { resolution: Resolution | null; tier: number | null } => {
  const resolutionTag = tags.find((tag) =>
    ["1080p", "720p", "2160p", "SD"].some((res) => tag.includes(res))
  );
  let resolution: Resolution | null = null;
  if (resolutionTag) {
    if (resolutionTag.includes("1080p")) resolution = "1080p";
    else if (resolutionTag.includes("720p")) resolution = "720p";
    else if (resolutionTag.includes("2160p")) resolution = "2160p";
    else if (resolutionTag.includes("SD")) resolution = "SD";
  }

  const tierTag = tags.find((tag) => tag.includes("Tier"));
  const tier = tierTag
    ? parseInt(tierTag.match(/Tier\s*(\d+)/)?.[1] ?? "0")
    : null;

  return { resolution, tier };
};

const createEmptyGroupStructure = (): GroupsByResolution => ({
  "2160p": {},
  "1080p": {},
  "720p": {},
  SD: {},
});

export const useGroups = () => {
  const [groups, setGroups] = useState<GroupsByResolution>(
    createEmptyGroupStructure()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const cache: CacheItem = JSON.parse(cachedData);
          if (Date.now() - cache.timestamp < CACHE_DURATION) {
            console.log("Using cached YAML data");
            setGroups(cache.data);
            setLoading(false);
            return;
          }
        }

        console.log("Loading from public folder...");
        const response = await fetch("/database/custom_formats/index.json");
        const fileList = await response.json();

        const yamlContents = await Promise.all(
          fileList.map(async (fileName: string) => {
            try {
              const response = await fetch(
                `/database/custom_formats/${fileName}`
              );
              const yamlText = await response.text();
              const parsedYaml = yaml.load(yamlText);
              return {
                name: fileName,
                content: parsedYaml,
              };
            } catch (error) {
              console.error(`Error parsing YAML file ${fileName}:`, error);
              return null;
            }
          })
        );

        const groupsByResolution = createEmptyGroupStructure();

        yamlContents
          .filter(
            (item): item is NonNullable<typeof item> =>
              item !== null &&
              Array.isArray(item.content.tags) &&
              item.content.tags.includes("Release Group")
          )
          .forEach((item) => {
            const { resolution, tier } = extractResolutionAndTier(
              item.content.tags
            );
            const tags = item.content.tags as string[];

            if (resolution && tier !== null) {
              if (!groupsByResolution[resolution][tier]) {
                groupsByResolution[resolution][tier] = [];
              }

              groupsByResolution[resolution][tier].push({
                name: item.content.name,
                hasManualRank: tags.includes("Manual Rank"),
                hasPopularRank: tags.includes("Popular Rank"),
              });
            }
          });

        const cacheItem: CacheItem = {
          timestamp: Date.now(),
          data: groupsByResolution,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheItem));

        setGroups(groupsByResolution);
      } catch (err) {
        console.error("Error fetching YAML files:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch groups")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
    const interval = setInterval(fetchGroups, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return { groups, loading, error };
};
