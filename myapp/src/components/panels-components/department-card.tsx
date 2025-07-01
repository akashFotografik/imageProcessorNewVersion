import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function DepartmentCard() {
  return (
    <Card className="w-full p-4 shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" alt="Engineering" />
            <AvatarFallback>EN</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Engineering</CardTitle>
            <CardDescription>Software development and technical operations</CardDescription>
          </div>
        </div>
        <div className="text-muted-foreground">...</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">45 employees</span>
            <span className="font-medium">Head: Alex Johnson</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span>73%</span>
            </div>
            <Progress value={73} className="h-2" />
          </div>
          <div className="text-sm">Budget: $2,500,000</div>
          <div className="text-sm">Location: New York</div>
          <Button className="w-full">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}