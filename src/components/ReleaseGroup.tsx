import { Copy, Check } from "lucide-react";
import { useExport } from "@hooks/useExport";

interface ReleaseGroupProps {
  name: string;
  hasManualRank: boolean;
  hasPopularRank: boolean;
}

const ReleaseGroup = ({
  name,
  hasManualRank,
  hasPopularRank,
}: ReleaseGroupProps) => {
  const { copied, createSingleFormat, copyToClipboard } = useExport();

  const handleExport = async () => {
    const format = createSingleFormat(name);
    await copyToClipboard(format);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:-translate-y-0.5">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
              {name}
            </h4>
            {/* Badges */}
            {(hasManualRank || hasPopularRank) && (
              <div className="flex gap-2">
                {hasManualRank && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800 transition-colors duration-300">
                    Manual
                  </span>
                )}
                {hasPopularRank && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800 transition-colors duration-300">
                    Popular
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Copy button */}
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default ReleaseGroup;
