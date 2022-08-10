![npm](https://img.shields.io/npm/v/@mdoudkin/nextjs-swr-wrapper)
![npm bundle size](https://img.shields.io/bundlephobia/min/@mdoudkin/nextjs-swr-wrapper?label=minified%20size)

## Installation

```
$ npm install @mdoudkin/nextjs-swr-wrapper
```

## Usage

```ts
// file: /api/something.ts
import { useUpdater } from "@mdoudkin/nextjs-swr-wrapper";
import { useCallback } from "react";

export const useCreateSomething = () => {
  const { act, isLoading, data, error } = useUpdater<Data, Error>({
    mutationKey: /https:\/\/example.com\/something.*/,
  });

  const actCallback = useCallback(
    (body) => act("https://example.com/something", "POST", body),
    [act]
  );

  return {
    act: actCallback,
    isLoading,
    data,
    error,
  };
};

// file: /components/something-form.tsx

export const SmtnForm = () => {
  const { act, isLoading, data, error } = useCreateSomething();

  return (
    <form onSubmit={(formData) => act(formData)}>
      ...
      <input type="submit" value="Create" disabled={isLoading}>
      <p>{error}</p>
    </form>
  )
};
```
