import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const ItemTable = ({ items, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>SKU</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Unit</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Current Quantity</TableHead>
        <TableHead>Stock Status</TableHead>
        <TableHead>Actions</TableHead>
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
          <TableCell>{item.price ? formatCurrency(item.price) : "-"}</TableCell>
          <TableCell>
            {item.totalQuantity != null ? Number(item.totalQuantity).toFixed(1) : "-"}
          </TableCell>
          <TableCell>
            {item.lowStockLevel != null && item.totalQuantity != null ? (
              <div className="flex flex-col gap-1">
                {Number(item.totalQuantity) <= Number(item.lowStockLevel) ? (
                  <Badge variant="destructive">Low</Badge>
                ) : (
                  <Badge variant="secondary">OK</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Threshold: {Number(item.lowStockLevel).toFixed(1)}
                  {item.unit ?? ""}
                </span>
              </div>
            ) : (
              "-"
            )}
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
              Delete
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
