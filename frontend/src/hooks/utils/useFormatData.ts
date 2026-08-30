import { useCallback } from "react";

import { formatData as formatDataUtil } from "../../utils/formatData";

export const useFormatData = () => {
  const formatData = useCallback((dateString: string): string => {
    return formatDataUtil(dateString);
  }, []);

  return {
    formatData,
  };
};
