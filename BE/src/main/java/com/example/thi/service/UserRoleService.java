package com.example.thi.service;

import com.example.thi.entity.UserRole;
import java.util.List;
import java.util.UUID;

public interface UserRoleService {
    List<UserRole> getAllUserRoles();
    UserRole getUserRoleById(UUID id);
    List<UserRole> getUserRolesByUserId(UUID userId);
    UserRole createUserRole(UserRole userRole);
    UserRole updateUserRole(UUID id, UserRole userRole);
    void deleteUserRole(UUID id);
}
