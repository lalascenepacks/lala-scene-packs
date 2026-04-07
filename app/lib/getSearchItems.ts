import fs from "fs";
import path from "path";

export type SearchItem = {
  type: "anime" | "series" | "movie" | "character";
  title: string;
  subtitle?: string;
  href: string;
  image: string;
  character?: string;
  aliases?: string[];
};

function getAliases(slug: string, type: "anime" | "series" | "movie") {
  const key = `${type}:${slug}`;

  const aliasesMap: Record<string, string[]> = {
    "series:the-vampire-diaries": [
      "diarios de um vampiro",
      "diário de um vampiro",
      "diario de um vampiro",
      "the vampire diaries",
      "vampire diaries",
      "tvd",
    ],

    "movie:challengers": [
      "challengers",
      "rivais",
      "zendaya",
    ],

    "movie:10-things-i-hate-about-you": [
      "10 things i hate about you",
      "ten things i hate about you",
      "10 coisas que eu odeio em voce",
      "10 coisas q eu odeio em voce",
      "10 coisas q eu odeio em vc",
      "10 coisas que eu odeio em vc",
      "10 things i hate about u",
      "10 things",
    ],

    "anime:jujutsu-kaisen": [
      "jjk",
      "jujutsu",
    ],

    "series:squid-game": [
      "red light green light",
      "sg",
      "squidgame",
      "round 6",
      "batatinha frita 1 2 3",
      "r6",
      "round6",
    ],

    "series:stranger-things": [
      "st",
      "strangerthings",
      "st5",
      "st1",
    ],

    "series:kakegurui": [
      "kakegurui la",
      "kg",
    ],

    "series:outer-banks": [
      "obx",
      "outer banks",
    ],

    "series:wednesday": [
      "wandinha",
      "wed",
      "jenna ortega",
    ],

    "movie:the-fallout":[
      "fallout",
      "a vida depois",
      "jenna ortega",
    ],

    "movie:winter-spring-summer-or-fall": [
      "As Quatro Estacoes do Amor",
      "wssof",
      "jenna ortega",
    ],

    "movie:twilight": [
      "crepusculo",
      "saga",
      "2008",
    ],

    "movie:culpa-mia": [
      "culpa minha",
      "my fault",
    ],

    "movie:culpa-nuestra": [
      "culpa nossa",
      "nossa culpa",
      "culpa nuestra",
      "our falt",
    ],

    "movie:culpa-tuya": [
      "culpa sua",
      "sua culpa",
      "culpa tuya",
      "your falt",
    ],

  };

  return aliasesMap[key] || [];
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

function getFolders(folderPath: string) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}

function buildCharacterItems(params: {
  baseFolder: "animes" | "series" | "movies";
  coverFolder: "animes" | "series" | "movies";
  itemName: string;
  typeLabel: "anime" | "series" | "movie";
}) {
  const { baseFolder, coverFolder, itemName, typeLabel } = params;

  const itemPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    baseFolder,
    itemName
  );

  if (!fs.existsSync(itemPath)) return [];

  const characters = getFolders(itemPath);

  return characters.map((character) => {
    const formattedTitle = formatLabel(character);
    const formattedSubtitle = formatLabel(itemName);

    if (typeLabel === "movie") {
      return {
        type: "character" as const,
        title: formattedTitle,
        subtitle: formattedSubtitle,
        href: `/movies/${itemName}#${character.toLowerCase()}`,
        image: `/covers/${coverFolder}/${itemName}.jpeg`,
        character: character.toLowerCase(),
      };
    }

    return {
      type: "character" as const,
      title: formattedTitle,
      subtitle: formattedSubtitle,
      href: `/${baseFolder}/${itemName}#${character.toLowerCase()}`,
      image: `/covers/${coverFolder}/${itemName}.jpeg`,
      character: character.toLowerCase(),
    };
  });
}

export function getSearchItems(): SearchItem[] {
  const animeNames = getFolders(
    path.join(process.cwd(), "public", "downloads", "animes")
  );

  const seriesNames = getFolders(
    path.join(process.cwd(), "public", "downloads", "series")
  );

  const movieNames = getFolders(
    path.join(process.cwd(), "public", "downloads", "movies")
  );

  const animeItems: SearchItem[] = animeNames.map((anime) => ({
    type: "anime",
    title: formatLabel(anime),
    subtitle: "Anime",
    href: `/animes/${anime}`,
    image: `/covers/animes/${anime}.jpeg`,
    aliases: getAliases(anime, "anime"),
  }));

  const seriesItems: SearchItem[] = seriesNames.map((serie) => ({
    type: "series",
    title: formatLabel(serie),
    subtitle: "Series",
    href: `/series/${serie}`,
    image: `/covers/series/${serie}.jpeg`,
    aliases: getAliases(serie, "series"),
  }));

  const movieItems: SearchItem[] = movieNames.map((movie) => ({
    type: "movie",
    title: formatLabel(movie),
    subtitle: "Movie",
    href: `/movies/${movie}`,
    image: `/covers/movies/${movie}.jpeg`,
    aliases: getAliases(movie, "movie"),
  }));

  const animeCharacters = animeNames.flatMap((anime) =>
    buildCharacterItems({
      baseFolder: "animes",
      coverFolder: "animes",
      itemName: anime,
      typeLabel: "anime",
    })
  );

  const seriesCharacters = seriesNames.flatMap((serie) =>
    buildCharacterItems({
      baseFolder: "series",
      coverFolder: "series",
      itemName: serie,
      typeLabel: "series",
    })
  );

  const movieCharacters = movieNames.flatMap((movie) =>
    buildCharacterItems({
      baseFolder: "movies",
      coverFolder: "movies",
      itemName: movie,
      typeLabel: "movie",
    })
  );

  return [
    ...animeItems,
    ...seriesItems,
    ...movieItems,
    ...animeCharacters,
    ...seriesCharacters,
    ...movieCharacters,
  ];
}