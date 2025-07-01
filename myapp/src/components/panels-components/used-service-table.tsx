import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const services = [
  {
    serviceName: "Web Development",
    serviceCost: "$1,200.00",
  },
  {
    serviceName: "Cloud Hosting",
    serviceCost: "$300.00",
  },
  {
    serviceName: "Database Management",
    serviceCost: "$450.00",
  },
  {
    serviceName: "UI/UX Design",
    serviceCost: "$750.00",
  },
  {
    serviceName: "API Integration",
    serviceCost: "$600.00",
  },
];

export function UsedServiceTable() {
  return (
    <Table>
      <TableCaption>A list of services used by the company.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Service Name</TableHead>
          <TableHead className="text-right">Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{service.serviceName}</TableCell>
            <TableCell className="text-right">{service.serviceCost}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
