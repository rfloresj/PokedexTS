import { CLICommand, initState, State } from './state.js';

export function getCommands(): Record<string, CLICommand> {
  return {
    help: {
      name: 'help',
      description: 'Displays a help message',
      callback: commandHelp,
    },
    exit: {
      name: 'exit',
      description: 'Exit the Pokedex',
      callback: commandExit,
    },
    map: {
      name: 'map',
      description:
        'Displays the names of 20 location areas in the Pokemon world.',
      callback: commandMap,
    },
    mapb: {
      name: 'mapb',
      description:
        'Displays the previous names of 20 locations areas in the Pokemon world.',
      callback: commandMapb,
    },
    explore: {
      name: 'explore',
      description:
        'takes the name of a location area as an argument and displays the list of all the Pokémon in a given location area.',
      callback: commandExplore,
    },
    catch: {
      name: 'catch',
      description:
        'takes the name of a pokemon as an argument and simulates catching that pokemon.',
      callback: commandCatch,
    },
    inspect: {
      name: 'inspect',
      description:
        'takes the name of a pokemon as an argument and displays detailed information about that pokemon.',
      callback: commandInspect,
    },
    pokedex: {
      name: 'pokedex',
      description: 'list all caught pokemon',
      callback: commandPokedex,
    },
    // can add more commands here
  };
}

export function cleanInput(input: string): string[] {
  return input
    .trim()
    .split(/\s+/)
    .map((i) => i.toLowerCase());
}

export async function commandHelp(state: State) {
  const usageLines = Object.values(state.commands)
    .map((cmd) => `${cmd.name}: ${cmd.description}`)
    .join('\n');
  const message = `Welcome to the Pokedex! 
Usage:

${usageLines}`;

  console.log(message);
}

export async function commandExit(state: State) {
  state.rl.close();
  console.log('Closing the Pokedex... Goodbye!');
  process.exit(0);
}

export async function commandMap(state: State) {
  const data = await state.pokeAPI.fetchLocations(
    state.nextLocationsURL ?? undefined,
  );

  for (const location of data.results) {
    console.log(location.name);
  }
  state.nextLocationsURL = data.next;
  state.prevLocationsURL = data.previous;
}

export async function commandMapb(state: State) {
  if (!state.prevLocationsURL) {
    console.log("you're on the first page");
    return;
  }
  const data = await state.pokeAPI.fetchLocations(
    state.prevLocationsURL ?? undefined,
  );

  for (const location of data.results) {
    console.log(location.name);
  }
  state.nextLocationsURL = data.next;
  state.prevLocationsURL = data.previous;
}

export function startREPL(state: State) {
  state.rl.prompt();

  state.rl.on('line', async (line: string) => {
    const words = cleanInput(line);

    if (words.length === 0) {
      state.rl.prompt();
      return;
    }
    const command = state.commands[words[0]];

    if (!command) {
      console.log('Unknown command');
    } else {
      try {
        await command.callback(state, ...words.slice(1));
      } catch (error) {
        console.log(error);
      }
    }

    state.rl.prompt();
  });
}

export async function commandExplore(state: State, ...args: string[]) {
  if (!args[0]) {
    console.log('Please provide a location name');
    return;
  }
  console.log(`Exploring ${args[0]}...`);
  console.log('Found Pokemon:');

  const data = await state.pokeAPI.fetchLocation(args[0]);
  for (const encounter of data.pokemon_encounters) {
    console.log(` - ${encounter.pokemon.name}`);
  }
}

export async function commandCatch(state: State, ...args: string[]) {
  if (!args[0]) {
    console.log('Please provide a pokemon name');
    return;
  }

  const pokemonName = args[0];
  console.log(`Throwing a Pokeball at ${pokemonName}...`);
  const pokemon = await state.pokeAPI.fetchPokemon(pokemonName);

  const catchChance = 1 / (pokemon.base_experience / 50 + 1);

  if (Math.random() < catchChance) {
    state.pokedex[pokemon.name] = pokemon;
    console.log(`${pokemon.name} was caught!`);
  } else {
    console.log(`${pokemon.name} escaped!`);
  }
}

export async function commandInspect(state: State, ...args: string[]) {
  if (!args[0]) {
    console.log('Please provide');
    return;
  }

  const pokemonData = state.pokedex[args[0]];

  if (pokemonData) {
    console.log(`Name: ${pokemonData.name}`);
    console.log(`Height: ${pokemonData.height}`);
    console.log(`Weight: ${pokemonData.weight}`);
    console.log('Stats:');
    for (const stat of pokemonData.stats) {
      console.log(`  -${stat.stat.name}: ${stat.base_stat}`);
    }
    console.log('Types:');
    for (const type of pokemonData.types) {
      console.log(`  - ${type.type.name}`);
    }
  } else {
    console.log('You have not caught that pokemon');
  }
}
export async function commandPokedex(state: State) {
  const pokemons = state.pokedex;
  if (Object.keys(pokemons).length === 0) {
    console.log('You have not caught any pokemon');
  } else {
    console.log('Your Pokedex:');
    for (const name of Object.keys(pokemons)) {
      console.log(`  - ${name}`);
    }
  }
}
