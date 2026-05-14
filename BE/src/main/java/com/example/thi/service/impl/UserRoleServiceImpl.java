package com.example.thi.service.impl;

import com.example.thi.entity.UserRole;
import com.example.thi.repository.UserRoleRepository;
import com.example.thi.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserRoleServiceImpl implements UserRoleService {

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Override
    public List<UserRole> getAllUserRoles() {
        return userRoleRepository.findAll();
    }

    @Override
    public UserRole getUserRoleById(UUID id) {
        return userRoleRepository.findById(id).orElse(null);
    }

    @Override
    public List<UserRole> getUserRolesByUserId(UUID userId) {
        return userRoleRepository.findAll().stream()
                .filter(ur -> ur.getUserId() != null && ur.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    @Override
    public UserRole createUserRole(UserRole userRole) {
        return userRoleRepository.save(userRole);
    }

    @Override
    public UserRole updateUserRole(UUID id, UserRole userRole) {
        UserRole existing = getUserRoleById(id);
        if (existing != null) {
            userRole.setId(id);
            return userRoleRepository.save(userRole);
        }
        return null;
    }

    @Override
    public void deleteUserRole(UUID id) {
        userRoleRepository.deleteById(id);
    }
}
