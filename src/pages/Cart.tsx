import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location captured successfully!");
        setLocationLoading(false);
      },
      (error) => {
        toast.error("Unable to get your location. Please enable location access.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const updateQuantity = (productId: string, change: number) => {
    const newCart = cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
    toast.success("Item removed from cart");
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      navigate("/auth");
      return;
    }

    if (!address || !phone) {
      toast.error("Please fill in all delivery details");
      return;
    }

    if (!location) {
      toast.error("Please share your location for delivery");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Group items by store
      const storeGroups: Record<string, any[]> = cart.reduce((acc, item) => {
        if (!acc[item.storeId]) {
          acc[item.storeId] = [];
        }
        acc[item.storeId].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Create an order for each store
      for (const [storeId, items] of Object.entries(storeGroups)) {
        const storeTotal = (items as any[]).reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Get store name
        const { data: storeData } = await supabase
          .from("stores")
          .select("name")
          .eq("id", storeId)
          .single();

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            store_id: storeId,
            total_amount: storeTotal,
            delivery_address: address,
            phone: phone,
            status: "pending",
            latitude: location.lat,
            longitude: location.lng,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = (items as any[]).map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Send email notification
        try {
          await supabase.functions.invoke("send-order-email", {
            body: {
              customerEmail: user.email,
              customerPhone: phone,
              deliveryAddress: address,
              storeName: storeData?.name || "Store",
              totalAmount: storeTotal,
              latitude: location.lat,
              longitude: location.lng,
              orderItems: (items as any[]).map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price * item.quantity,
              })),
              orderId: order.id,
            },
          });
          console.log("Order email sent successfully");
        } catch (emailError) {
          console.error("Failed to send order email:", emailError);
        }
      }

      // Clear cart
      setCart([]);
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdate"));

      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 animate-fade-in">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground" />
            <h2 className="text-3xl font-outfit font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add some items from local stores to get started
            </p>
            <Link to="/stores">
              <Button size="lg">Browse Stores</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link to="/stores">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-outfit font-bold mb-6">Your Cart</h1>

            {cart.map((item) => (
              <Card key={item.id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-outfit font-semibold text-lg">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.storeName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ₹{item.price * item.quantity}
                        </span>

                        <div className="flex items-center gap-2 bg-secondary rounded-lg px-2 py-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-outfit font-bold">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{getTotalAmount()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">₹30</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">
                      ₹{getTotalAmount() + 30}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete delivery address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Delivery Location</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-1 gap-2"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      {location
                        ? "Location Captured ✓"
                        : "Share Current Location"}
                    </Button>
                    {location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
