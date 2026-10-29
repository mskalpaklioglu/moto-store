import { Badge } from "@/components/common/primitives";
import { orderStatusLabels, paymentStatusLabels, stockLabels } from "@/lib/labels";
import type { OrderStatus, PaymentStatus, StockStatus } from "@/types";

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={orderStatusLabels[status].tone}>{orderStatusLabels[status].label}</Badge>
);
export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge tone={paymentStatusLabels[status].tone}>{paymentStatusLabels[status].label}</Badge>
);
export const StockBadge = ({ status }: { status: StockStatus }) => (
  <Badge tone={stockLabels[status].tone}>{stockLabels[status].label}</Badge>
);
