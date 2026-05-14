package com.example.thi.service;

import com.example.thi.entity.Product;
import java.util.List;
import java.util.UUID;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(UUID id);
    Product createProduct(Product product);
    Product updateProduct(UUID id, Product product);
    void deleteProduct(UUID id);
}
