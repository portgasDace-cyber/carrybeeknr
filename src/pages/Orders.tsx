import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package, CheckCircle2, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  stores: {
    name: string;
  };
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        stores (name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <Package className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const markAsDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
      return;
    }

    toast.success("Order marked as delivered!");
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-outfit font-bold mb-2 animate-fade-in">
          My Orders
        </h1>
        <p className="text-muted-foreground mb-8">Track your order history</p>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-outfit font-semibold text-xl mb-2">
                No orders yet
              </h3>
              <p className="text-muted-foreground">
                Start shopping to place your first order
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Card
                key={order.id}
                className="animate-scale-in hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          className={`${getStatusColor(order.status)} text-white flex items-center gap-1`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Order #{order.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="font-outfit font-semibold text-lg">
                        {order.stores?.name || "Store"}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address}
                      </p>

                      {order.latitude && order.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          View on Map
                        </a>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Ordered on{" "}
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-left md:text-right space-y-2">
                      <p className="text-2xl font-bold text-primary">
                        ₹{order.total_amount}
                      </p>
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => markAsDelivered(order.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
