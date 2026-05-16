import { Cache } from './pokecache.js';

export class PokeAPI {
  private static readonly baseURL = 'https://pokeapi.co/api/v2';
  private cache: Cache;

  constructor() {
    this.cache = new Cache(60000);
  }

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url = pageURL ?? `${PokeAPI.baseURL}/location-area`;
    const cached = this.cache.get(url);
    if (cached) {
      console.log('Cache hit!');
      return cached.val;
    }
    console.log('Cache miss, fetching from API...');

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      this.cache.add(url, data);
      return data;
    } else {
      throw new Error();
    }
  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}`;
    const cached = this.cache.get(url);
    if (cached) {
      console.log('Cache hit!');
      return cached.val;
    }
    console.log('Cache miss, fetching from API...');
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      this.cache.add(url, data);
      return data;
    } else {
      throw new Error();
    }
  }

  async fetchPokemon(pokemonName: string): Promise<Pokemon> {
    const url = `${PokeAPI.baseURL}/pokemon/${pokemonName}`;
    const cached = this.cache.get(url);
    if (cached) {
      console.log('Cache hit!');
      return cached.val;
    }
    console.log('Cache miss, fetching from API...');
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      this.cache.add(url, data);
      return data;
    } else {
      throw new Error();
    }
  }
}

export type ShallowLocations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
};

export type Location = {
  pokemon_encounters: {
    pokemon: {
      name: string;
      url: string;
    };
  }[];
};

export type Pokemon = {
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  stats: [
    {
      base_stat: number;
      stat: {
        name: string;
      };
    },
  ];
  types: [
    {
      type: {
        name: string;
      };
    },
  ];
};
