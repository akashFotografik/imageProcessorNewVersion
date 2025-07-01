"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
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
    label: "Credits left",
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
      <CardHeader className="items-center pb-0">
        <CardTitle>Company Credit Usage</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={360}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip />}
            />
            <RadialBar
              dataKey="usedCredits"
              stackId="a"
              cornerRadius={10}
              fill="var(--color-companyA)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remainingCredits"
              stackId="a"
              cornerRadius={10}
              fill="hsl(200, 60%, 70%)"
              className="stroke-transparent stroke-2"
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {totalCredits.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
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