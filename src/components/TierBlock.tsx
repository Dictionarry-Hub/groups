// src/components/TierBlock.tsx
import ReleaseGroup from "./ReleaseGroup";
import { Group } from "@hooks/useGroups";

interface TierBlockProps {
  tier: string;
  groups: Group[];
}

const TierBlock = ({ tier, groups }: TierBlockProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          Tier {tier}
        </h3>
        <div className="ml-4 h-[1px] flex-grow bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent transition-colors duration-300" />
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
