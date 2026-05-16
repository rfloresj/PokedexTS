export type CacheEntry<T> = {
  createdAt: number;
  val: T;
};

export class Cache {
  #cache = new Map<string, CacheEntry<any>>();
  #reapIntervalId: NodeJS.Timeout | undefined = undefined;
  #interval: number;

  constructor(interval: number) {
    this.#interval = interval;
    this.#startReapLoop();
  }

  public add<T>(key: string, val: T): void {
    this.#cache.set(key, {
      createdAt: Date.now(),
      val: val,
    });
  }

  public get<T>(key: string) {
    const entry = this.#cache.get(key);
    if (!entry) {
      return undefined;
    }
    return entry;
  }

  #reap() {
    this.#cache.forEach((entry, key) => {
      if (Date.now() - entry.createdAt > this.#interval) {
        this.#cache.delete(key);
      }
    });
  }

  #startReapLoop() {
    this.#reapIntervalId = setInterval(() => this.#reap(), this.#interval);
  }

  public stopReapLoop(){
    clearInterval(this.#reapIntervalId);
    this.#reapIntervalId = undefined;
  }
}
