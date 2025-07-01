import React from "react";
import { PanelTable } from "@/components/panel-table";
import { Card } from "@/components/ui/card";
import { PanelSectionCards } from "@/components/panel-section-cards";
import MultiCompanyGraph from "@/components/panels-components/multi-company-graph";
import CreditUsedGraph from "@/components/panels-components/credit-used-graph";
import { UsedServiceTable } from "@/components/panels-components/used-service-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowBigDown, ArrowDown, ChevronDown } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import DepartmentCard from "@/components/panels-components/department-card";

const page = () => {
  return (
    <div className="p-4">
      <div className="flex gap-4 justify-between w-full">
        <div className="w-1/2">
          <div>
            <PanelSectionCards />
          </div>
          <div className="mt-4">
            <MultiCompanyGraph />
          </div>
          <Card className="flex items-center justify-between mt-4">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              Departments <ArrowBigDown />{" "}
            </h1>
          </Card>
        </div>
        <div className="w-1/2">
          <Card className="p-4">
            <PanelTable />
          </Card>
          <Card className="mt-4 p-4">
            <div className="flex gap-4 w-full justify-between">
              <div className="w-1/2">
                <CreditUsedGraph />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <IconPlus />
                    <span className="hidden lg:inline">Add Service</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        Company <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[
                        "Acme Corp",
                        "Globex",
                        "Umbrella",
                        "Wayne Enterprises",
                      ].map((company) => (
                        <DropdownMenuItem key={company}>
                          {company}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Card className="p-4 h-full">
                  <div className="flex items-center justify-center -mb-4">
                    <h1 className="text-lg font-semibold">Services Used</h1>
                  </div>
                  <UsedServiceTable />
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="mt-4 w-full">
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <DepartmentCard />
            <DepartmentCard />
            <DepartmentCard />
          </div>
          <div className="flex justify-end gap-4 items-center">
            <Button className="w-40">+ 5 more</Button>
            <Button className="w-40">Add Department</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default page;
