import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function KpiCard({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  description,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>

        {Icon && <Icon className={`h-4 w-4 ${color}`} />}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {value?.toLocaleString?.() ?? value ?? 0}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}