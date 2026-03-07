type CategoryBadgeProps = {
  name: string;
  small?: boolean;
};

export default function CategoryBadge({
  name,
  small = false,
}: CategoryBadgeProps) {
  if (!name) return null;

  return (
    <span
      className={`inline-block bg-gold/10 text-gold-dark font-medium uppercase tracking-wider ${
        small ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"
      } rounded-sm`}
    >
      {name}
    </span>
  );
}
