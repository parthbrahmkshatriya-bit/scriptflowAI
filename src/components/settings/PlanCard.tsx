import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  name: string;
  priceUsd: number;
  priceInr: number;
  features: string[];
  highlighted?: boolean;
}

export default function PlanCard({ name, priceUsd, priceInr, features, highlighted }: Props) {
  return (
    <Card className={highlighted ? "border-primary" : ""}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          {highlighted && <Badge>Popular</Badge>}
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold">${priceUsd}</span>
          <span className="text-muted-foreground text-sm">/mo</span>
          <span className="text-muted-foreground text-xs ml-2">(₹{priceInr}/mo)</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="text-sm flex items-center gap-2">
              <span className="text-primary">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
