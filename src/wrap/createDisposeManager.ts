export function createDisposeManager(): IDisposeManager {
  const arr: any[] = [];
  const disposeAll: IDisposeManager = () => {
    for (let i = 0; i < arr.length; i++) {
      arr[i]();
    }
    arr.length = 0;
  };
  disposeAll.storage = arr;
  return disposeAll;
}

export interface IDisposeManager {
  (): void;

  storage: Array<() => void>;
}
