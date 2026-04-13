type Props = {
  background: string;
};

/** Полноэкранный атмосферный фон под контентом (погода + день/ночь в СПб). */
export default function WeatherBackdrop({ background }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 min-h-[100dvh] transition-[background] duration-[2.4s] ease-out"
      style={{ background }}
    />
  );
}
