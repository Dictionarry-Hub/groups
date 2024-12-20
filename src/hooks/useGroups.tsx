import { useEffect, useState } from "react";
import axios from "axios";
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

const CACHE_KEY = "github_yml_cache";
const CACHE_DURATION = 30 * 60 * 1000;
const GITHUB_API_BASE = "https://api.github.com";
const REPO_PATH =
  "repos/Dictionarry-Hub/database/contents/custom_formats?ref=1080p-Encode";

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

        console.log("Fetching from GitHub...");
        const response = await axios.get(`${GITHUB_API_BASE}/${REPO_PATH}`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        });

        const yamlFiles = response.data.filter(
          (file: any) =>
            file.name.endsWith(".yml") || file.name.endsWith(".yaml")
        );

        const yamlContents = await Promise.all(
          yamlFiles.map(async (file: any) => {
            try {
              const contentResponse = await axios.get(file.download_url);
              const parsedYaml = yaml.load(contentResponse.data);
              return {
                name: file.name,
                content: parsedYaml,
              };
            } catch (error) {
              console.error(`Error parsing YAML file ${file.name}:`, error);
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
