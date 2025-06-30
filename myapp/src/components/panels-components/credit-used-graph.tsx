"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
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
} from "@/components/ui/chart"

// Define interface for type safety
interface ChartDataPoint {
  company: string
  usedCredits: number
  remainingCredits: number
}

// Define interface for custom tooltip props
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; dataKey: string }>
}

const chartData: ChartDataPoint[] = [
  { company: "Company A", usedCredits: 1260, remainingCredits: 740 },
]

const chartConfig: ChartConfig = {
  usedCredits: {
    label: "Used Credits",
    color: "var(--chart-1)", // Color for used credits
  },
  remainingCredits: {
    label: "Remaining Credits",
    color: "hsl(200, 60%, 70%)", // Light blue for remaining credits
  },
  companyA: {
    label: "Company A",
    color: "var(--chart-1)",
  },
}

// Custom tooltip component for improved responsiveness
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-background p-3 shadow-md border border-muted">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartConfig[entry.dataKey as keyof ChartConfig]?.color }}
            />
            <span className="text-muted-foreground">{chartConfig[entry.dataKey as keyof ChartConfig]?.label}:</span>
            <span className="font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const CreditUsedGraph: React.FC = () => {
  // Calculate total credits and usage rate
  const totalCredits = chartData[0].usedCredits + chartData[0].remainingCredits
  const calculateTrend = (): string => {
    const totalUsed = chartData[0].usedCredits
    const trend = (totalUsed / totalCredits * 100).toFixed(1)
    return trend
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle>Company Credit Usage</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex h-46">
        <ChartContainer
          config={chartConfig}
          className="h-60"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0} // Start from left
            endAngle={180} // End on right
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalCredits.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Total Credits
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="usedCredits"
              stackId="a"
              cornerRadius={0}
              fill="var(--color-companyA)" // Used credits on left
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remainingCredits"
              stackId="a"
              cornerRadius={0}
              fill="hsl(200, 60%, 70%)" // Remaining credits on right, light blue
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Usage rate {calculateTrend()}% this period <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing credit usage for {chartData[0].company} (January - June 2025)
        </div>
      </CardFooter>
    </Card>
  )
}

export default CreditUsedGraph