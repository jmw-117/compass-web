export default function DimensionBar({lower, upper}: {lower: number; upper: number}) {
  return <div className="area-scale" aria-hidden="true">
    {upper > lower && <span className="area-range" style={{left: lower + '%', width: (upper - lower) + '%'}} />}
    <span className="area-known" style={{width: lower + '%'}} />
  </div>;
}
