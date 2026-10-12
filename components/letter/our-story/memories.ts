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
};

export const MEMORIES: Memory[] = [
  {
    date: "December 2023",
    title: "First time meeting each other",
    body: "A Japan family trip turned out to be our first chance to get to know each other. A trip that changed our lives forever.",
    caption: "Japan ♡",
    image: "/our-story/first-time-meeting.jpg",
    width: 1252,
    height: 2000,
    tilt: -2.4,
  },
  {
    date: "May 2024",
    title: "Meeting each other again",
    body: "With Vince living in Japan and KC in the Philippines, our long-distance relationship has lots of challenges, but we try our best to overcome all of them.",
    caption: "together again",
    image: "/our-story/meeting-again.jpg",
    width: 1500,
    height: 2000,
    tilt: 2,
  },
  {
    date: "March 2025",
    title: "Enjoying our time together",
    body: "Missing each other all the time; with our 2 suitcases, we travel and travel and travel. Spending time with each other as much as we can.",
    caption: "two suitcases",
    image: "/our-story/enjoying-our-time.jpg",
    width: 1125,
    height: 2000,
    tilt: 1.6,
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
