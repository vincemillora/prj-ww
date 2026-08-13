"use client";

import Image from "next/image";
import { motion } from "motion/react";

/** Next.js image delivery with Motion's shared-layout animation support. */
export const MotionImage = motion.create(Image);
