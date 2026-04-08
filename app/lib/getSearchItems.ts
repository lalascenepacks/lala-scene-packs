import { catalog } from "./catalog";

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

    "movie:the-fallout": [
      "fallout",
      "a vida depois",
      "jenna ortega",
    ],

    "movie:winter-spring-summer-or-fall": [
      "as quatro estacoes do amor",
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
      "our fault",
    ],

    "movie:culpa-tuya": [
      "culpa sua",
      "sua culpa",
      "culpa tuya",
      "your fault",
    ],

    "movie:miller's-girl": [
      "miller girl",
      "millers girl",
      "a garota de miller",
      "garota de miller",
    ],
  };

  return aliasesMap[key] || [];
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

export function getSearchItems(): SearchItem[] {
  const animeItems: SearchItem[] = catalog
    .filter((item) => item.type === "anime")
    .map((anime) => ({
      type: "anime",
      title: formatLabel(anime.name),
      subtitle: "Anime",
      href: anime.href,
      image: anime.cover,
      aliases: getAliases(anime.name, "anime"),
    }));

  const seriesItems: SearchItem[] = catalog
    .filter((item) => item.type === "series")
    .map((serie) => ({
      type: "series",
      title: formatLabel(serie.name),
      subtitle: "Series",
      href: serie.href,
      image: serie.cover,
      aliases: getAliases(serie.name, "series"),
    }));

  const movieItems: SearchItem[] = catalog
    .filter((item) => item.type === "movie")
    .map((movie) => ({
      type: "movie",
      title: formatLabel(movie.name),
      subtitle: "Movie",
      href: movie.href,
      image: movie.cover,
      aliases: getAliases(movie.name, "movie"),
    }));

  return [
    ...animeItems,
    ...seriesItems,
    ...movieItems,
  ];
}