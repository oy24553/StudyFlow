export default function Skeleton({ height = 24, radius = 12 }) {
  return <div className="skeleton" style={{ height, borderRadius: radius }} />;
}
