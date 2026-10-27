const Skeleton = ({ className = "" }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-lg bg-subtle ${className}`} />
);

export default Skeleton;
