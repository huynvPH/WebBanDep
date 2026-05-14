package com.example.thi.service.impl;

import com.example.thi.entity.Order;
import com.example.thi.entity.OrderItem;
import com.example.thi.entity.Product;
import com.example.thi.repository.OrderItemRepository;
import com.example.thi.repository.OrderRepository;
import com.example.thi.repository.ProductRepository;
import com.example.thi.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderItemServiceImpl implements OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    @Override
    public OrderItem getOrderItemById(UUID id) {
        return orderItemRepository.findById(id).orElse(null);
    }

    @Override
    public List<OrderItem> getOrderItemsByOrderId(UUID orderId) {
        return orderItemRepository.findAll().stream()
                .filter(item -> item.getOrder() != null && item.getOrder().getId().equals(orderId))
                .collect(Collectors.toList());
    }

    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        if (orderItem.getProduct() != null && orderItem.getProduct().getId() != null) {
            Product product = productRepository.findById(orderItem.getProduct().getId()).orElse(null);
            if (product != null && orderItem.getOrder() != null && orderItem.getOrder().getId() != null) {
                Order order = orderRepository.findById(orderItem.getOrder().getId()).orElse(null);
                if (order != null) {
                    int qty = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
                    int current = product.getStock() != null ? product.getStock() : 0;
                    product.setStock(Math.max(0, current - qty));
                    productRepository.save(product);
                }
            }
        }
        return orderItemRepository.save(orderItem);
    }

    @Override
    public OrderItem updateOrderItem(UUID id, OrderItem orderItem) {
        OrderItem existing = getOrderItemById(id);
        if (existing != null) {
            orderItem.setId(id);
            return orderItemRepository.save(orderItem);
        }
        return null;
    }

    @Override
    public void deleteOrderItem(UUID id) {
        orderItemRepository.deleteById(id);
    }
}
