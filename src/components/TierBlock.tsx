// src/components/TierBlock.tsx
import { Copy, Check } from "lucide-react";
import ReleaseGroup from "./ReleaseGroup";
import { Group } from "@hooks/useGroups";
import { useExport } from "@hooks/useExport";

interface TierBlockProps {
  tier: string;
  groups: Group[];
  resolution: string;
}

const TierBlock = ({ tier, groups, resolution }: TierBlockProps) => {
  const { copied, createTierFormat, copyToClipboard } = useExport();

  const handleExport = async () => {
    const format = createTierFormat(
      resolution,
      tier,
      groups.map((g) => g.name)
    );
    await copyToClipboard(format);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          Tier {tier}
        </h3>
        <div className="ml-4 h-[1px] flex-grow bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent transition-colors duration-300" />
        <button
          onClick={handleExport}
          className="ml-4 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 
                   text-gray-600 dark:text-gray-300
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-all duration-300"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <ReleaseGroup
            key={group.name}
            name={group.name}
            hasManualRank={group.hasManualRank}
            hasPopularRank={group.hasPopularRank}
          />
        ))}
      </div>
    </div>
  );
};

export default TierBlock;
