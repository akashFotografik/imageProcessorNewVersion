"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Define interfaces for type safety
interface ChartDataPoint {
  month: string
  [key: string]: number | string // Allow dynamic company keys
}

const chartData: ChartDataPoint[] = [
  { month: "January", companyA: 186, companyB: 80, companyC: 150 },
  { month: "February", companyA: 305, companyB: 200, companyC: 250 },
  { month: "March", companyA: 237, companyB: 120, companyC: 180 },
  { month: "April", companyA: 73, companyB: 190, companyC: 220 },
  { month: "May", companyA: 209, companyB: 130, companyC: 200 },
  { month: "June", companyA: 214, companyB: 140, companyC: 260 },
]

const chartConfig: ChartConfig = {
  companyA: {
    label: "Company A",
    color: "var(--chart-1)",
  },
  companyB: {
    label: "Company B",
    color: "var(--chart-2)",
  },
  companyC: {
    label: "Company C",
    color: "var(--chart-3)",
  },
}

const MultiCompanyGraph: React.FC = () => {
  // Extract company keys from chartData (excluding month)
  const companyKeys = Object.keys(chartData[0]).filter(key => key !== "month")

  // Calculate average trend for display
  const calculateTrend = (): string => {
    const lastMonth = chartData[chartData.length - 1]
    const secondLastMonth = chartData[chartData.length - 2]
    const totalLast = companyKeys.reduce((sum, key) => sum + (lastMonth[key] as number), 0)
    const totalSecondLast = companyKeys.reduce((sum, key) => sum + (secondLastMonth[key] as number), 0)
    const trend = ((totalLast - totalSecondLast) / totalSecondLast * 100).toFixed(1)
    return trend
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Credit Purchases</CardTitle>
        <CardDescription>Monthly Credit Purchases (January - June 2024)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: 'Credits Purchased',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {companyKeys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending {Number(calculateTrend()) > 0 ? 'up' : 'down'} by {Math.abs(Number(calculateTrend()))}% this month 
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total credit purchases for {companyKeys.length} companies over the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default MultiCompanyGraph