import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export const ItemTable = ({ items }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>SKU</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Unit</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Low Stock</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.sku}</TableCell>
          <TableCell>
            <Badge>{item.type}</Badge>
          </TableCell>
          <TableCell>{item.unit}</TableCell>
          <TableCell>
            {item.price ? formatCurrency(item.price) : "-"}
          </TableCell>
          <TableCell>{item.lowStockLevel || "-"}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
