import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingOrders, updateSaleItemStatus } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Sale, SaleItem } from "@shared/schema";

// Define statusColors and statusBorderColors with types
const statusColors = {
  PENDING: "bg-yellow-500",
  PREPPING: "bg-orange-500",
  DONE: "bg-green-500",
} as const;
const statusBorderColors = {
  PENDING: "border-yellow-500",
  PREPPING: "border-orange-500",
  DONE: "border-green-500",
} as const;

function Kitchen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<{
    sale: Sale;
    items: (SaleItem & { itemName: string })[];
  } | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/kitchen/orders"],
    queryFn: getPendingOrders,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Force refetch on invalidation
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateSaleItemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kitchen/orders"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Layout title="Kitchen" description="Manage order preparation">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Kitchen" description="Manage order preparation">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No pending orders
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.sale.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <OrderCard
                  order={order}
                  mutation={updateMutation}
                  onClick={() => setSelectedOrder(order)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Order #{selectedOrder.sale.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {formatDate(selectedOrder.sale.createdAt)}
              </p>
              <div className="space-y-2">
                {selectedOrder.items.map(
                  (item: SaleItem & { itemName: string }) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <p>
                        {item.qty}x {item.itemName}
                      </p>
                      <Badge className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

const OrderCard = ({
  order,
  mutation,
  onClick,
}: {
  order: { sale: Sale; items: (SaleItem & { itemName: string })[] };
  mutation: any;
  onClick: () => void;
}) => {
  const getNextStatus = (current: string): string | null => {
    switch (current) {
      case "PENDING":
        return "PREPPING";
      case "PREPPING":
        return "DONE";
      default:
        return null;
    }
  };

  const handleUpdateStatus = (item: SaleItem, nextStatus: string | null) => {
    if (nextStatus) {
      mutation.mutate({ id: item.id, status: nextStatus });
    }
  };

  // Safety check: handle empty items array
  if (!order.items || order.items.length === 0) {
    return (
      <Card className="flex flex-col h-full border-gray-300">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Order #{order.sale.id.slice(-6).toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No items in this order
          </p>
        </CardContent>
      </Card>
    );
  }

  const allItemsDone = order.items.every(
    (item: SaleItem) => item.status === "DONE"
  );
  const firstItemStatus = order.items[0]?.status || "PENDING";

  return (
    <Card
      className={`flex flex-col h-full cursor-pointer ${
        allItemsDone
          ? "border-green-500"
          : statusBorderColors[
              firstItemStatus as keyof typeof statusBorderColors
            ]
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Order #{order.sale.id.slice(-6).toUpperCase()}
        </CardTitle>
        <Badge
          variant={allItemsDone ? "default" : "secondary"}
          className={allItemsDone ? "bg-green-600" : ""}
        >
          {allItemsDone ? "Completed" : "In Progress"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {order.items.map((item: SaleItem & { itemName: string }) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {item.qty}x {item.itemName || "Unknown Item"}
                </p>
                <Badge
                  className={`text-xs ${
                    statusColors[item.status as keyof typeof statusColors]
                  }`}
                  variant="default"
                >
                  {item.status}
                </Badge>
              </div>
              {item.status !== "DONE" && (
                <Button
                  size="sm"
                  onClick={() =>
                    handleUpdateStatus(item, getNextStatus(item.status))
                  }
                  disabled={mutation.isPending}
                >
                  {getNextStatus(item.status) === "PREPPING" ? "Prep" : "Done"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 pt-0 text-xs text-muted-foreground text-center">
        {formatDate(order.sale.createdAt)}
      </div>
    </Card>
  );
};

export default Kitchen;
