"use client";

import { useLayoutEffect, useRef } from "react";
import type { LeaderboardId } from "@/lib/leaderboards";

type Props = {
  boardId: LeaderboardId;
  direction: 1 | -1;
  children: React.ReactNode;
};

function restartAnimation(el: HTMLElement, className: string) {
  el.classList.remove("board-animate-in-right", "board-animate-in-left");
  void el.offsetWidth;
  el.classList.add(className);
}

export function BoardTransition({ boardId, direction, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const animClass =
      direction > 0 ? "board-animate-in-right" : "board-animate-in-left";
    restartAnimation(root, animClass);

    for (const node of root.querySelectorAll<HTMLElement>(
      ".board-stagger-1, .board-stagger-2, .board-stagger-3"
    )) {
      const staggerClass = node.classList.contains("board-stagger-1")
        ? "board-stagger-1"
        : node.classList.contains("board-stagger-2")
          ? "board-stagger-2"
          : "board-stagger-3";
      restartAnimation(node, staggerClass);
    }
  }, [boardId, direction]);

  return (
    <div ref={ref} className="board-transition-root">
      {children}
    </div>
  );
}
