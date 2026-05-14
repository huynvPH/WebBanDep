package com.example.thi.service;

import com.example.thi.entity.OrderItem;
import java.util.List;
import java.util.UUID;

public interface OrderItemService {
    List<OrderItem> getAllOrderItems();
    OrderItem getOrderItemById(UUID id);
    List<OrderItem> getOrderItemsByOrderId(UUID orderId);
    OrderItem createOrderItem(OrderItem orderItem);
    OrderItem updateOrderItem(UUID id, OrderItem orderItem);
    void deleteOrderItem(UUID id);
}
