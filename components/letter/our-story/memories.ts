export type Memory = {
  date: string;
  title: string;
  body: string;
  caption: string;
  /** Path under /public. Leave unset to show the striped placeholder. */
  image?: string;
  /** The image file's real pixel size, so the lightbox keeps its shape. */
  width?: number;
  height?: number;
  /** CSS object-position for the square Polaroid crop. Defaults to centre. */
  position?: string;
  tilt: number;
  /** Extra prints stacked behind the main one, as a draggable deck. */
  more?: StoryPhoto[];
};

/** An extra print in a memory's stack. Same fields as the memory's own photo. */
export type StoryPhoto = {
  image: string;
  width?: number;
  height?: number;
  position?: string;
  caption: string;
};

/** One print as the Polaroid draws it: a memory's own photo or one of `more`. */
export type StoryPrint = Partial<StoryPhoto> & {
  /** Lightbox morph id. The first print keeps the memory's original id. */
  id: string;
  caption: string;
};

/** Every print of a memory, front first. */
export function printsOf(memory: Memory): StoryPrint[] {
  const { date, image, width, height, position, caption, more = [] } = memory;
  return [
    { id: `story-${date}`, image, width, height, position, caption },
    ...more.map((photo, i) => ({ id: `story-${date}-${i + 1}`, ...photo })),
  ];
}

export const MEMORIES: Memory[] = [
  {
    date: "December 2023",
    title: "First time meeting each other",
    body: "A Japan family trip that became the opportunity to meet and get to know each other for the first time. Little did we know this trip would change our lives.",
    caption: "Japan ♡",
    image: "/our-story/first-time-meeting.jpg",
    width: 1252,
    height: 2000,
    tilt: -2.4,
  },
  {
    date: "May 2024",
    title: "Date night at Sühring, Bangkok",
    body: "A long distance relationship wasn't what we preferred, but it was definitely something we were both willing to work with.\nThis made us all the more grateful for every opportunity we had to meet ❤️",
    caption: "together again",
    image: "/our-story/meeting-again.jpg",
    width: 1500,
    height: 2000,
    tilt: 2,
    more: [
      {
        image: "/our-story/meeting-again-2.jpg",
        width: 1500,
        height: 2000,
        caption: "together again",
      },
    ],
  },
  {
    date: "March 2025",
    title: "Enjoying our time together",
    body: "Missing each other all the time; with our 2 suitcases, we travel and travel and travel. Spending time with each other as much as we can.",
    caption: "our travels",
    image: "/our-story/enjoying-our-time.jpg",
    width: 1125,
    height: 2000,
    tilt: 1.6,
    more: [
      {
        image: "/our-story/enjoying-our-time-2.jpg",
        width: 1500,
        height: 2000,
        caption: "our travels",
      },
      {
        image: "/our-story/enjoying-our-time-3.jpg",
        width: 1477,
        height: 1108,
        caption: "our travels",
      },
      {
        image: "/our-story/enjoying-our-time-4.jpg",
        width: 1500,
        height: 2000,
        caption: "our travels",
      },
      {
        image: "/our-story/enjoying-our-time-5.jpg",
        width: 1500,
        height: 2000,
        caption: "our travels",
      },
      {
        image: "/our-story/enjoying-our-time-6.jpg",
        width: 1500,
        height: 2000,
        caption: "our travels",
      },
      {
        image: "/our-story/enjoying-our-time-7.jpg",
        width: 2000,
        height: 1500,
        caption: "our travels",
      },
      {
        image: "/our-story/enjoying-our-time-8.jpg",
        width: 1125,
        height: 1500,
        caption: "our travels",
      },
    ],
  },
  {
    date: "November 2025",
    title: "The Proposal",
    body: "Back to where it began, enjoying a trip with the family, but with a special ring underneath, finally popping the question on top of a ferris wheel.",
    caption: "the ferris wheel ♡",
    image: "/our-story/the-proposal.jpg",
    width: 1500,
    height: 2000,
    tilt: -1.8,
    more: [
      {
        image: "/our-story/the-proposal-ring.jpg",
        width: 1500,
        height: 2000,
        caption: "the ring ♡",
      },
    ],
  },
  {
    date: "May 2026",
    title: "Next Chapter",
    body: "Gathering everyone we love, gaining everyone’s blessing and support to face the next chapter of our lives.",
    caption: "everyone we love",
    image: "/our-story/next-chapter.jpg",
    width: 1125,
    height: 2000,
    position: "center 60%",
    tilt: 2.2,
  },
];
