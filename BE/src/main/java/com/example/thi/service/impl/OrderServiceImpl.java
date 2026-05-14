package com.example.thi.service.impl;

import com.example.thi.entity.Order;
import com.example.thi.repository.OrderRepository;
import com.example.thi.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(UUID id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public Order createOrder(Order order) {
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> item.setOrder(order));
        }
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrder(UUID id, Order order) {
        Order existing = getOrderById(id);
        if (existing != null) {
            order.setId(id);
            if (order.getOrderItems() != null) {
                order.getOrderItems().forEach(item -> item.setOrder(order));
            }
            return orderRepository.save(order);
        }
        return null;
    }

    @Override
    public void deleteOrder(UUID id) {
        orderRepository.deleteById(id);
    }
}
