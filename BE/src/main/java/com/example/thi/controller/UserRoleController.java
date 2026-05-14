package com.example.thi.controller;

import com.example.thi.entity.UserRole;
import com.example.thi.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-roles")
@CrossOrigin("*")
public class UserRoleController {

    @Autowired
    private UserRoleService userRoleService;

    @GetMapping
    public ResponseEntity<List<UserRole>> getAllUserRoles() {
        return ResponseEntity.ok(userRoleService.getAllUserRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRole> getUserRoleById(@PathVariable UUID id) {
        UserRole userRole = userRoleService.getUserRoleById(id);
        return userRole != null ? ResponseEntity.ok(userRole) : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserRole>> getUserRolesByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(userRoleService.getUserRolesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserRole> createUserRole(@RequestBody UserRole userRole) {
        return ResponseEntity.ok(userRoleService.createUserRole(userRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRole> updateUserRole(@PathVariable UUID id, @RequestBody UserRole userRole) {
        UserRole updated = userRoleService.updateUserRole(id, userRole);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserRole(@PathVariable UUID id) {
        userRoleService.deleteUserRole(id);
        return ResponseEntity.noContent().build();
    }
}
