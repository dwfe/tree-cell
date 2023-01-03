export function createDisposeManager(): IDisposeAll {
  const arr: any[] = [];
  const disposeAll: IDisposeAll = () => {
    for (let i = 0; i < arr.length; i++) {
      arr[i]();
    }
    arr.length = 0;
  };
  disposeAll.storage = arr;
  return disposeAll;
}

interface IDisposeAll {
  (): void;

  storage: Array<() => void>;
}
