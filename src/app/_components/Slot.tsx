import React from "react";

function easeOutQuad(
  elapsed: number,
  initialValue: number,
  amountOfChange: number,
  duration: number
) {
  return -amountOfChange * (elapsed /= duration) * (elapsed - 2) + initialValue;
}

interface SlotContext {
  registerItemRef: (ref: HTMLElement) => void;
}
const slotContext = React.createContext<SlotContext | null>(null);
const SlotProvider = slotContext.Provider;
const useSlot = () => {
  const context = React.useContext(slotContext);
  if (!context) throw new Error("useSlot must be used within a SlotProvider");

  return context;
};

export function Slot({
  duration = 3000,
  target,
  easing = easeOutQuad,
  times = 1,
  onEnd = () => {},
  children,
  className = "",
}: {
  duration?: number;
  target: number | null;
  easing?: (
    elapsed: number,
    initialValue: number,
    amountOfChange: number,
    duration: number
  ) => number;
  times?: number;
  onEnd?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const targetRefs = React.useRef<HTMLElement[]>([]);

  React.useEffect(() => {
    if (!containerRef.current || target === null) return;
    const containerElement = containerRef.current;

    containerElement.scrollTop = 0;

    const $target = targetRefs.current[target];

    if ($target == null) return;

    const fullScroll =
      targetRefs.current[targetRefs.current.length - 1].offsetTop;
    const targetOffset =
      $target.offsetTop +
      ($target.clientHeight - containerElement.clientHeight) / 2;

    const totalScroll = targetOffset + fullScroll * (times - 1);

    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        onEnd();
        return;
      }

      const amount = easing(elapsed, 0, totalScroll, duration);
      containerElement.scrollTop = amount % fullScroll;

      requestAnimationFrame(tick);
    };

    tick();
  }, [target]);

  return (
    <SlotProvider
      value={{
        registerItemRef: (ref) => {
          targetRefs.current.push(ref);
        },
      }}
    >
      <div
        className={"overflow-hidden relative " + className}
        ref={containerRef}
      >
        {children}
      </div>
    </SlotProvider>
  );
}

export function SlotItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { registerItemRef } = useSlot();

  return (
    <div
      ref={(ref) => {
        if (ref) registerItemRef(ref);
      }}
      className={className}
    >
      {children}
    </div>
  );
}
