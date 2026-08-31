import { COUPLE_NAMES } from "@/lib/wedding";

const [NAME_A, NAME_B] = COUPLE_NAMES;

export type Memory = {
  date: string;
  title: string;
  body: string;
  caption: string;
  image?: string;
  tilt: number;
};

export const MEMORIES: Memory[] = [
  {
    date: "April 2019",
    title: "A broken umbrella",
    body: `${NAME_B} and ${NAME_A} shelter under the same café awning in Nakameguro. The offered umbrella turns out to be broken — the argument about whether it still counts as chivalry lasts two hours.`,
    caption: "the café awning ♡",
    tilt: -2.4,
  },
  {
    date: "September 2020",
    title: "First apartment",
    body: "Two suitcases, one very small kitchen, and a shared conviction that a rice cooker counts as furniture.",
    caption: "moving day",
    tilt: 2,
  },
  {
    date: "June 2022",
    title: "Enter Mochi",
    body: "A very opinionated cat adopts us. Sunday-morning pancake experiments begin in earnest (success rate: improving).",
    caption: "Mochi arrives ♡",
    tilt: 1.6,
  },
  {
    date: "October 2025",
    title: "The proposal",
    body: "Back on the same street corner where it began — with a working umbrella this time, and a ring hidden in its handle.",
    caption: "same corner ♡",
    tilt: -1.8,
  },
  {
    date: "Next summer",
    title: "The next chapter",
    body: "Gathering everyone we love in one garden, under one hopefully unnecessary canopy of umbrellas.",
    caption: "the garden",
    tilt: 2.2,
  },
];
