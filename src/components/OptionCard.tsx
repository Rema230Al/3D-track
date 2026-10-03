import { motion } from "framer-motion";
import { Mixed, pad, tilt } from "./ui";

/**
 * Large single-select option: an extruded slab with a check; selecting presses it home.
 * With an `index` it shows a line number; without one just a neutral pixel bullet.
 */
export default function OptionCard({
  index,
  label,
  selected,
  onSelect,
}: {
  index?: number;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="pop group w-full" {...tilt}>
      <span className="pop__back" />
      <span className="pop__front flex min-h-[60px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
        {index !== undefined ? (
          <span
            dir="ltr"
            className="w-6 shrink-0 font-mono text-xs font-medium text-tq-violet/70 transition-colors group-aria-checked:text-tq-apricot"
          >
            {pad(index + 1)}
          </span>
        ) : (
          <span aria-hidden="true" className="grid w-3 shrink-0 place-items-center sm:w-4">
            <span className="size-2 rounded-[2px] bg-tq-violet/70 transition-colors group-aria-checked:bg-tq-apricot" />
          </span>
        )}
        <span className="flex-1 text-[15.5px] font-medium leading-relaxed sm:text-[17px]">
          <Mixed text={label} />
        </span>
        <span
          className="grid size-6 shrink-0 place-items-center rounded-[5px] border-2 border-tq-line bg-tq-bg transition-colors group-aria-checked:border-tq-apricot group-aria-checked:bg-tq-apricot"
          aria-hidden="true"
        >
          {selected && (
            <motion.svg
              viewBox="0 0 12 12"
              className="size-3.5"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 22 }}
            >
              <path d="M2 6.5 5 9.2 10.2 3" fill="none" stroke="#0e0b18" strokeWidth="2.4" strokeLinecap="square" />
            </motion.svg>
          )}
        </span>
      </span>
    </button>
  );
}
