import { useEffect, useState } from "react";
import { getAccounts, getCategories, type Account, type Category, type CategoryType } from "@/lib/api-client";

export function useFinanceOptions(categoryType?: CategoryType) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    const accountsRequest = getAccounts({ isActive: true });
    const categoriesRequest: Promise<Category[]> = categoryType
      ? getCategories({ type: categoryType, isActive: true })
      : Promise.resolve([]);

    Promise.all([accountsRequest, categoriesRequest])
      .then(([accountData, categoryData]) => {
        if (!active) return;
        setAccounts(accountData);
        setCategories(categoryData);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load account and category options.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoryType]);

  return { accounts, categories, isLoading, error };
}
