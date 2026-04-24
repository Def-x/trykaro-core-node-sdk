"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ProductlistCard from "../cart/ProductlistCard";
import { EmptyState } from "../ui/EmptyState";
import { Spinner } from "../ui/Spinner";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useCore } from "../../context/CoreProvider";

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const OrderConfirmationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const fallbackToast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg),
};

export const Order = (props) => {
  const { orderId } = props;
  const params = useParams();
  const id = orderId || params?.orderid;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormat();

  const show = searchParams.get("show") === "true";

  const { actions, config, orgData, toast = fallbackToast } = useCore();
  const orgDetail = orgData;
  const orgRaffles = []; // Raffles array placeholder

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        if (!actions?.getOrderById) {
          throw new Error("getOrderById action is not available");
        }
        const orderData = await actions.getOrderById(id, config?.storeId);
        setData(orderData);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, actions, config?.storeId]);

  const { order_number, created_at, cart, order_type, state, order_status, payment_state, payment_status } = data || {};
  const {
    shipping_address,
    billing_address,
    line_items,
    display_total,
    display_item_total,
    display_ship_total,
    display_tax_total,
  } = cart || {};

  const fullShippingAddress = [
    shipping_address?.address1,
    shipping_address?.address2,
    shipping_address?.city,
    shipping_address?.state_name,
    shipping_address?.zipcode,
    shipping_address?.country_name,
  ]
    .filter(Boolean)
    .join(", ");

  const fullBillingAddress = [
    billing_address?.address1,
    billing_address?.address2,
    billing_address?.city,
    billing_address?.state_name,
    billing_address?.zipcode,
    billing_address?.country_name,
  ]
    .filter(Boolean)
    .join(", ");

  const storePickUpAddress =
    orgDetail?.organization_setting?.store_pickup_info?.store_pickup_address;

  const orderDate = created_at ? new Date(created_at).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) : "";

  const onDownloadReceipt = async () => {
    try {
      setIsFetchingInvoice(true);
      if (!actions?.getOrderInvoice) {
        throw new Error("getOrderInvoice action is not available");
      }
      const res = await actions.getOrderInvoice(id);

      if (res) {
        window.open(res, "_blank");
      }
    } catch (err) {
      console.error("Invoice download failed", err);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsFetchingInvoice(false);
    }
  };

  return isLoading ? (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  ) : isError ? (
    <div className="flex justify-center">
      <EmptyState title={"Order not found"} />
    </div>
  ) : (
    <div className="flex justify-center items-start mx-[16px] md:mx-[32px] mt-[100px] mb-[100px]">
      <div className="w-full overflow-hidden flex justify-center">
        <div className="flex flex-col md:flex-row flex-wrap gap-[15px] max-w-[1248px] w-full">
          {/* Left Section */}
          <div className="flex-1 flex flex-col gap-8">
            {show && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <OrderConfirmationIcon />
                <div className="flex flex-col">
                  <p className="font-[Nunito-medium] text-[20px] text-[#00214c]">
                    THANK YOU. YOUR ORDER HAS BEEN RECEIVED
                  </p>
                  <p className="font-[Nunito-regular] text-[16px] text-[#00214c] mt-[10px]">
                    Order number: {order_number}
                  </p>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-[Nunito-medium] text-[20px] text-[#00214c]">
                  ORDER DETAILS
                </h3>
                <button
                  className="font-[monrat] font-bold bg-[#00214c] text-[#ffffff] flex items-center gap-1 p-2 rounded cursor-pointer"
                  onClick={onDownloadReceipt}
                  disabled={isFetchingInvoice}
                >
                  {isFetchingInvoice ? (
                    <Spinner />
                  ) : (
                    <>
                      Receipt <DownloadIcon />
                    </>
                  )}
                </button>
              </div>

              <div className=" border border-[#00214c] p-[16px] grid grid-cols-1 gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                      Order number
                    </p>
                    <p className="font-[Nunito-medium] text-[14px] text-[#00214c]">
                      {order_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                      Order status
                    </p>
                    <p className="font-[Nunito-medium] text-[14px] text-[#00214c] uppercase">
                      {order_status}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                      Order date
                    </p>
                    <p className="font-[Nunito-medium] text-[14px] text-[#00214c]">
                      {orderDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                      Payment status
                    </p>
                    <p className="font-[Nunito-medium] text-[14px] text-[#00214c] uppercase">
                      {payment_status}
                    </p>
                  </div>
                </div>

                {order_type === "pickup" ? (
                  <div>
                    <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                      Pickup address
                    </p>
                    <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                      {storePickUpAddress}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 mt-2">
                      {/* Delivery Address */}
                      <div>
                        <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                          Delivery address
                        </p>
                        <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                          {shipping_address?.label}
                        </p>
                        <div className="border border-[#e8e5df] my-1" />
                        <p className="font-[Nunito-medium] text-[14px] text-[#00214c]">
                          {shipping_address?.firstname ??
                            ""} {shipping_address?.lastname ??
                              ""}{shipping_address?.phone && ` | ${shipping_address?.phone}`}
                        </p>
                        <div className="border border-[#e8e5df] my-1" />
                        <p className="font-[Nunito-medium] text-[14px] text-[#00214c]">
                          {fullShippingAddress}
                        </p>
                      </div>
                      {/* Billing Address */}
                      <div>
                        <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                          Billing address
                        </p>
                        <p className="text-[14px] text-[#00214c] font-[Nunito-regular]">
                          {billing_address?.label}
                        </p>
                        <div className="border border-[#e8e5df] my-1" />
                        <p className="font-[Nunito-medium] text-[14px] text-[#00214c]">
                          {billing_address?.firstname ??
                            ""} {billing_address?.lastname ??
                              ""}{billing_address?.phone && ` | ${billing_address?.phone}`}
                        </p>
                        <div className="border border-[#e8e5df] my-1" />
                        <p className="font-[Nunito-medium] text-[14px] text-[#00214c]">
                          {fullBillingAddress}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              className="text-white py-3 hidden md:block transition cursor-pointer bg-[#00214c] font-[Nunito-medium] text-4 hover:opacity-90"
              onClick={() => router.push("/")}
            >
              Shop More
            </button>
          </div>
          <div className="border border-[#e8e5df] hidden md:block" />

          {/* Right Section */}
          <div className="flex-1 flex flex-col gap-8 mt-[32px] md:mt-0">
            {/* Ordered Items */}
            <div>
              <h3 className="font-[Nunito-medium] text-[20px] text-[#00214c]">
                ORDERED ITEMS({line_items?.length || 0})
              </h3>
              <div className="flex flex-col gap-4 mt-8">
                {line_items?.map((item, idx) => {
                  const orgRaffleId =
                    item?.line_itemable?.organization_raffle_id;

                  const associateRaffle = orgRaffles?.find(
                    (data) => data?.id === orgRaffleId,
                  );
                  return (
                    <ProductlistCard
                      product={item}
                      key={idx}
                      component="order"
                      raffleName={associateRaffle?.raffle_name}
                      orderType={order_type}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bill Summary */}
            <div>
              <h3 className="font-[Nunito-medium] text-[20px] text-[#00214c] mb-4">
                BILL SUMMARY
              </h3>
              <div className="flex flex-col gap-2 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-[Nunito-regular] text-[14px] text-[#00214c]">
                    Item Total
                  </span>
                  <span className="font-[Nunito-regular] text-[12px] text-[#00214c]">
                    {formatCurrency(display_item_total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-[Nunito-regular] text-[14px] text-[#00214c]">
                    Tax
                  </span>
                  <span className="font-[Nunito-regular] text-[12px] text-[#00214c]">
                    {formatCurrency(display_tax_total)}
                  </span>
                </div>
                {order_type !== "pickup" && (
                  <div className="flex justify-between">
                    <span className="font-[Nunito-regular] text-[14px] text-[#00214c]">
                      Total Shipping
                    </span>
                    <span className="font-[Nunito-regular] text-[12px] text-[#00214c]">
                      {display_ship_total === "0.00" || display_ship_total === 0 || display_ship_total === "0"
                        ? "Free"
                        : `${formatCurrency(display_ship_total)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg">
                  <span className="font-[Nunito-medium] text-[16px] text-[#00214c]">
                    Total Payment
                  </span>
                  <span className="font-[Nunito-bold] text-[16px] text-[#00214c]">
                    {formatCurrency(display_total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            className="text-white py-3 mt-8 block md:hidden transition cursor-pointer bg-[#00214c] font-[Nunito-medium] text-4 hover:opacity-90"
            onClick={() => router.push("/")}
          >
            Shop More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
