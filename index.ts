import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";

export const useUpdater = <RES = any, E = any>(
  options: { mutationKey?: string | RegExp } = {}
) => {
  const { cache, mutate } = useSWRConfig();
  const { mutationKey } = options;

  const [data, setData] = useState<RES>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    error: E;
    meta: { status: number };
  }>();

  const performRequest = useCallback(
    async (
      url: string,
      method: string,
      body: any
    ): Promise<{ data?: RES; error?: RequestError<E> }> => {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: new Headers({
          ...{ "Content-Type": "application/json" },
        }),
      });

      if (res.status.toString().startsWith("2")) {
        const data = (await res.json()) as RES;
        return { data };
      } else {
        const error = {
          meta: { status: res.status },
          error: (await res.json()) as E,
        };
        return { error };
      }
    },
    []
  );

  const performMutation = useCallback(async () => {
    if (typeof mutationKey === "string") {
      return mutate(mutationKey);
    }

    if (mutationKey instanceof RegExp) {
      if (!(cache instanceof Map)) {
        throw new Error(
          "matchMutate requires the cache provider to be a Map instance"
        );
      }

      const keys: string[] = [];

      for (const key of (cache as Map<string, any>).keys()) {
        if (mutationKey?.test(key)) {
          keys.push(key);
        }
      }

      const mutations = keys.map((key) => mutate(key));
      return Promise.all(mutations);
    }
  }, [cache, mutate, mutationKey]);

  const act = useCallback(
    async (url: string, method: string, body: any) => {
      try {
        setIsLoading(true);

        const { data, error } = await performRequest(url, method, body);
        setData(data);
        setError(error);

        performMutation();

        return { data, error };
      } finally {
        setIsLoading(false);
      }
    },
    [performMutation, performRequest]
  );

  return { act, isLoading, data, error };
};

type RequestError<E> = {
  error: E;
  meta: {
    status: number;
  };
};
